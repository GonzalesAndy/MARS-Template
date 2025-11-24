import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { mockClients, type ContratTemplate, type SouscriptionOption, type Souscription } from '@/mocks/data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  ArrowLeft, 
  Save, 
  X,
  FileText,
  Euro,
  CheckCircle2,
  Circle,
  Info,
} from 'lucide-react';

export default function SubscriptionCreatePage() {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  const client = mockClients.find(c => c.id === clientId);
  const template: ContratTemplate | undefined = location.state?.template;

  const [formData, setFormData] = useState({
    periodicite: 'mensuelle' as 'mensuelle' | 'annuelle',
    date_souscription: new Date().toISOString().split('T')[0],
    date_debut: '',
    duree: template?.duree_standard || 12,
    etat: 'planifié' as 'actif' | 'planifié' | 'résilié' | 'annulé',
    agent_origine: 'Agent Actuel',
  });

  const [optionsStatus, setOptionsStatus] = useState<SouscriptionOption[]>([]);
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  // Initialize options status
  useEffect(() => {
    if (template) {
      setOptionsStatus(
        template.options.map(opt => ({
          option_id: opt.id,
          statut: 'non souscrite'
        }))
      );
    }
  }, [template]);

  // Calculate montants
  const calculateMontants = () => {
    if (!template) return { mensuel: 0, annuel: 0 };

    const subscribedOptions = template.options.filter(opt => 
      optionsStatus.find(os => os.option_id === opt.id && os.statut === 'souscrite')
    );

    if (formData.periodicite === 'mensuelle') {
      const optionsCost = subscribedOptions.reduce((sum, opt) => sum + opt.prix_mensuel, 0);
      const mensuel = template.tarif_base_mensuel + optionsCost;
      const annuel = mensuel * 12;
      return { mensuel, annuel };
    } else {
      const optionsCost = subscribedOptions.reduce((sum, opt) => sum + opt.prix_annuel, 0);
      const annuel = template.tarif_base_annuel + optionsCost;
      const mensuel = annuel / 12;
      return { mensuel, annuel };
    }
  };

  const montants = calculateMontants();

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: false }));
  };

  const toggleOption = (optionId: string) => {
    setOptionsStatus(prev =>
      prev.map(os =>
        os.option_id === optionId
          ? { ...os, statut: os.statut === 'souscrite' ? 'non souscrite' : 'souscrite' }
          : os
      )
    );
  };

  const handleSave = () => {
    const newErrors: Record<string, boolean> = {};
    
    if (!formData.date_souscription) newErrors.date_souscription = true;
    if (!formData.duree || formData.duree <= 0) newErrors.duree = true;
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const newSouscription: Souscription = {
      id: `SUB${Date.now()}`,
      client_id: clientId!,
      contrat_template_id: template!.id,
      code_souscription: `${template!.code_contrat}-${Date.now()}`,
      periodicite: formData.periodicite,
      date_souscription: formData.date_souscription,
      date_debut: formData.date_debut || undefined,
      duree: formData.duree,
      etat: formData.etat,
      options_souscrites: optionsStatus,
      montant_mensuel: montants.mensuel,
      montant_annuel: montants.annuel,
      agent_origine: formData.agent_origine,
      date_origine: new Date().toISOString().split('T')[0],
      modified_at: new Date().toISOString(),
      modified_by: formData.agent_origine,
    };

    navigate(`/client/${clientId}/contracts`, {
      state: { newSouscription }
    });
  };

  const handleCancel = () => {
    navigate(`/client/${clientId}/contracts/catalog`);
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
  };

  const getDomainColor = (domaine: string) => {
    switch (domaine) {
      case 'Assurance': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'Téléphonie': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'Énergie': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'Internet': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  if (!client || !template) {
    return (
      <div className="max-w-7xl mx-auto text-center py-20">
        <h1 className="text-3xl font-bold text-foreground mb-4">
          {!client ? 'Client introuvable' : 'Contrat non sélectionné'}
        </h1>
        <Button onClick={() => navigate(`/client/${clientId}/contracts/catalog`)}>
          Retour au catalogue
        </Button>
      </div>
    );
  }

  const canSave = formData.date_souscription && formData.duree > 0;

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button 
          variant="ghost" 
          onClick={handleCancel}
          className="hover:bg-accent/50"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour au catalogue
        </Button>

        <div className="flex gap-2">
          <Button onClick={handleCancel} variant="ghost" className="gap-2">
            <X className="h-4 w-4" />
            Annuler
          </Button>
          <Button onClick={handleSave} disabled={!canSave} className="gap-2">
            <Save className="h-4 w-4" />
            Créer la souscription
          </Button>
        </div>
      </div>

      {/* Title */}
      <div className="bg-card/40 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-border/50 animate-slide-up">
        <div className="flex items-center gap-4">
          <FileText className="h-10 w-10 text-primary" />
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-foreground">
              Nouvelle Souscription
            </h1>
            <p className="text-muted-foreground mt-2">
              Client: {client.denomination}
            </p>
          </div>
        </div>
      </div>

      {/* Contract Template Recap (Read-only) */}
      <div className="bg-card/40 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-border/50 animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <div className="flex items-center gap-2 mb-6">
          <Info className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">
            Récapitulatif du Contrat
          </h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <span className={`px-3 py-1 rounded-full border text-xs font-medium ${getDomainColor(template.domaine)}`}>
                {template.domaine}
              </span>
              <h3 className="text-xl font-bold text-foreground mt-3">
                {template.intitule}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {template.code_contrat}
              </p>
            </div>
          </div>

          <p className="text-muted-foreground">
            {template.descriptif}
          </p>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="bg-background/50 rounded-xl p-4 border border-border/50">
              <p className="text-sm text-muted-foreground mb-1">Tarif Base Mensuel</p>
              <p className="text-xl font-bold text-foreground">
                {formatCurrency(template.tarif_base_mensuel)}
              </p>
            </div>
            <div className="bg-background/50 rounded-xl p-4 border border-border/50">
              <p className="text-sm text-muted-foreground mb-1">Tarif Base Annuel</p>
              <p className="text-xl font-bold text-foreground">
                {formatCurrency(template.tarif_base_annuel)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Subscription Form */}
      <div className="bg-card/40 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-border/50 animate-slide-up" style={{ animationDelay: '0.15s' }}>
        <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
          <FileText className="h-6 w-6 text-primary" />
          Informations de Souscription
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Périodicité */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Périodicité *
            </label>
            <select
              value={formData.periodicite}
              onChange={(e) => handleChange('periodicite', e.target.value as 'mensuelle' | 'annuelle')}
              className="w-full bg-background border border-input rounded-md px-3 py-2 text-foreground"
            >
              <option value="mensuelle">Mensuelle</option>
              <option value="annuelle">Annuelle</option>
            </select>
          </div>

          {/* Date Souscription */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Date de Souscription *
            </label>
            <Input
              type="date"
              value={formData.date_souscription}
              onChange={(e) => handleChange('date_souscription', e.target.value)}
              className={errors.date_souscription ? 'border-red-500' : ''}
            />
          </div>

          {/* Date Début */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Date de Début
            </label>
            <Input
              type="date"
              value={formData.date_debut}
              onChange={(e) => handleChange('date_debut', e.target.value)}
            />
          </div>

          {/* Durée */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Durée (mois) *
            </label>
            <Input
              type="number"
              value={formData.duree}
              onChange={(e) => handleChange('duree', parseInt(e.target.value) || 0)}
              placeholder="12"
              min="1"
              className={errors.duree ? 'border-red-500' : ''}
            />
          </div>
        </div>
      </div>

      {/* Options Selection */}
      <div className="bg-card/40 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-border/50 animate-slide-up" style={{ animationDelay: '0.2s' }}>
        <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
          <CheckCircle2 className="h-6 w-6 text-primary" />
          Sélection des Options
        </h2>

        {template.options.length > 0 ? (
          <div className="space-y-4">
            {template.options.map(option => {
              const isSubscribed = optionsStatus.find(os => os.option_id === option.id)?.statut === 'souscrite';
              
              return (
                <div
                  key={option.id}
                  className={`bg-background/50 rounded-xl p-6 border transition-all cursor-pointer ${
                    isSubscribed 
                      ? 'border-primary/50 shadow-lg shadow-primary/10' 
                      : 'border-border/50 hover:border-border'
                  }`}
                  onClick={() => toggleOption(option.id)}
                >
                  <div className="flex items-start gap-4">
                    <div className="mt-1">
                      {isSubscribed ? (
                        <CheckCircle2 className="h-6 w-6 text-primary" />
                      ) : (
                        <Circle className="h-6 w-6 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground">{option.nom}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {option.description}
                          </p>
                        </div>
                        {option.est_gratuite ? (
                          <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-xs font-medium ml-3">
                            Gratuite
                          </span>
                        ) : (
                          <div className="text-right ml-3">
                            <p className="text-sm font-semibold text-foreground">
                              {formatCurrency(formData.periodicite === 'mensuelle' ? option.prix_mensuel : option.prix_annuel)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              /{formData.periodicite === 'mensuelle' ? 'mois' : 'an'}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">
            Aucune option disponible pour ce contrat
          </p>
        )}
      </div>

      {/* Financial Summary */}
      <div className="bg-card/40 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-border/50 animate-slide-up" style={{ animationDelay: '0.25s' }}>
        <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
          <Euro className="h-6 w-6 text-primary" />
          Récapitulatif Financier
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-background/50 rounded-xl p-6 border border-border/50">
            <p className="text-sm text-muted-foreground mb-2">Montant Mensuel</p>
            <p className="text-3xl font-bold text-primary">
              {formatCurrency(montants.mensuel)}
              <span className="text-sm text-muted-foreground font-normal">/mois</span>
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Incluant {optionsStatus.filter(os => os.statut === 'souscrite').length} option(s)
            </p>
          </div>

          <div className="bg-background/50 rounded-xl p-6 border border-accent/50">
            <p className="text-sm text-muted-foreground mb-2">Montant Annuel</p>
            <p className="text-3xl font-bold text-accent">
              {formatCurrency(montants.annuel)}
              <span className="text-sm text-muted-foreground font-normal">/an</span>
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Total sur {formData.duree} mois: {formatCurrency(montants.mensuel * formData.duree)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
