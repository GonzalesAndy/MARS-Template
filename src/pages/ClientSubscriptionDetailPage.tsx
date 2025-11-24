import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { mockClients, mockContratsTemplates, type Souscription, type ContratTemplate } from '@/mocks/data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  ArrowLeft, 
  Save, 
  Edit, 
  X,
  FileText,
  Calendar,
  DollarSign,
  CheckCircle2,
  XCircle,
  Ban,
  Clock,
  Info,
  Circle,
} from 'lucide-react';

export default function ClientSubscriptionDetailPage() {
  const { clientId, subscriptionId } = useParams<{ clientId: string; subscriptionId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  const client = mockClients.find(c => c.id === clientId);
  const [mode, setMode] = useState<'view' | 'edit'>(
    location.state?.mode || 'view'
  );

  // Initialize form state from passed souscription
  const initialSouscription: Souscription = location.state?.souscription || {
    id: subscriptionId || '',
    client_id: clientId || '',
    contrat_template_id: '',
    code_souscription: '',
    periodicite: 'mensuelle',
    date_souscription: new Date().toISOString().split('T')[0],
    date_debut: '',
    duree: 12,
    etat: 'planifié',
    options_souscrites: [],
    montant_mensuel: 0,
    montant_annuel: 0,
    agent_origine: 'Agent Actuel',
    date_origine: new Date().toISOString().split('T')[0],
  };

  const [formData, setFormData] = useState<Souscription>(initialSouscription);
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  
  // State for termination dialog
  const [showTerminateDialog, setShowTerminateDialog] = useState(false);
  const [dateFin, setDateFin] = useState('');

  // Get the contract template
  const template: ContratTemplate | undefined = mockContratsTemplates.find(
    t => t.id === formData.contrat_template_id
  );

  // Recalculate amounts when options or periodicite change
  useEffect(() => {
    if (!template) return;

    const subscribedOptions = template.options.filter(opt =>
      formData.options_souscrites.find(os => os.option_id === opt.id && os.statut === 'souscrite')
    );

    let montant_mensuel: number;
    let montant_annuel: number;

    if (formData.periodicite === 'mensuelle') {
      const optionsCost = subscribedOptions.reduce((sum, opt) => sum + opt.prix_mensuel, 0);
      montant_mensuel = template.tarif_base_mensuel + optionsCost;
      montant_annuel = montant_mensuel * 12;
    } else {
      const optionsCost = subscribedOptions.reduce((sum, opt) => sum + opt.prix_annuel, 0);
      montant_annuel = template.tarif_base_annuel + optionsCost;
      montant_mensuel = montant_annuel / 12;
    }

    setFormData(prev => ({
      ...prev,
      montant_mensuel,
      montant_annuel
    }));
  }, [formData.periodicite, formData.options_souscrites, template]);

  if (!client || !template) {
    return (
      <div className="max-w-7xl mx-auto text-center py-20">
        <h1 className="text-3xl font-bold text-foreground mb-4">
          {!client ? 'Client introuvable' : 'Contrat introuvable'}
        </h1>
        <Button onClick={() => navigate('/dashboard')}>
          Retour à la recherche
        </Button>
      </div>
    );
  }

  const handleChange = (field: keyof Souscription, value: string | number | undefined) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: false }));
  };

  const toggleOption = (optionId: string) => {
    setFormData(prev => ({
      ...prev,
      options_souscrites: prev.options_souscrites.map(os =>
        os.option_id === optionId
          ? { ...os, statut: os.statut === 'souscrite' ? 'non souscrite' : 'souscrite' }
          : os
      )
    }));
  };

  const handleSave = () => {
    const newErrors: Record<string, boolean> = {};
    
    if (!formData.date_souscription) newErrors.date_souscription = true;
    if (!formData.duree || formData.duree <= 0) newErrors.duree = true;
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const updatedSouscription: Souscription = {
      ...formData,
      modified_at: new Date().toISOString(),
      modified_by: 'Agent Actuel'
    };

    navigate(`/client/${clientId}/contracts`, {
      state: { updatedSouscription }
    });
  };

  const handleTerminate = () => {
    setDateFin(new Date().toISOString().split('T')[0]);
    setShowTerminateDialog(true);
  };

  const handleConfirmTerminate = () => {
    if (!dateFin) {
      alert('Veuillez saisir une date de fin');
      return;
    }
    
    const terminated: Souscription = {
      ...formData,
      etat: 'résilié',
      date_fin: dateFin,
      modified_at: new Date().toISOString(),
      modified_by: 'Agent Actuel'
    };
    
    navigate(`/client/${clientId}/contracts`, {
      state: { updatedSouscription: terminated }
    });
  };

  const handleCancel = () => {
    if (mode === 'edit') {
      setMode('view');
      setFormData(initialSouscription);
      setErrors({});
    }
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const getEtatIcon = (etat: string) => {
    switch (etat) {
      case 'actif': return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'planifié': return <Clock className="h-5 w-5 text-blue-500" />;
      case 'résilié': return <XCircle className="h-5 w-5 text-orange-500" />;
      case 'annulé': return <Ban className="h-5 w-5 text-red-500" />;
      default: return null;
    }
  };

  const getEtatColor = (etat: string) => {
    switch (etat) {
      case 'actif': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'planifié': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'résilié': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'annulé': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
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

  const canSave = formData.date_souscription && (formData.duree || 0) > 0;

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button 
          variant="ghost" 
          onClick={() => navigate(`/client/${clientId}/contracts`)}
          className="hover:bg-accent/50"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour à la liste
        </Button>

        <div className="flex gap-2">
          {mode === 'view' && (
            <>
              <Button onClick={() => setMode('edit')} className="gap-2">
                <Edit className="h-4 w-4" />
                Modifier
              </Button>
              {formData.etat === 'actif' && (
                <Button variant="destructive" onClick={handleTerminate} className="gap-2">
                  <XCircle className="h-4 w-4" />
                  Résilier
                </Button>
              )}
            </>
          )}
          {mode === 'edit' && (
            <>
              <Button onClick={handleCancel} variant="ghost" className="gap-2">
                <X className="h-4 w-4" />
                Annuler
              </Button>
              <Button onClick={handleSave} disabled={!canSave} className="gap-2">
                <Save className="h-4 w-4" />
                Valider
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Title */}
      <div className="bg-card/40 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-border/50 animate-slide-up">
        <div className="flex items-center gap-4">
          <FileText className="h-10 w-10 text-primary" />
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-foreground">
              {template.intitule}
            </h1>
            <p className="text-muted-foreground mt-2">
              Client: {client.denomination}
            </p>
            {mode === 'view' && formData.code_souscription && (
              <p className="text-sm text-muted-foreground/70 font-mono mt-1">{formData.code_souscription}</p>
            )}
          </div>
          {mode === 'view' && (
            <span className={`px-4 py-2 rounded-full border text-sm font-medium flex items-center gap-2 ${getEtatColor(formData.etat)}`}>
              {getEtatIcon(formData.etat)}
              {formData.etat}
            </span>
          )}
        </div>
      </div>

      {/* Contract Template Info (Read-only) */}
      <div className="bg-card/40 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-border/50 animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <div className="flex items-center gap-2 mb-6">
          <Info className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">
            Informations du Contrat (Catalogue)
          </h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <span className={`px-3 py-1 rounded-full border text-xs font-medium ${getDomainColor(template.domaine)}`}>
                {template.domaine}
              </span>
              <p className="text-sm text-muted-foreground mt-3">
                Code: {template.code_contrat}
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

      {/* Subscription Information */}
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
            {mode === 'view' ? (
              <p className="text-foreground capitalize">{formData.periodicite}</p>
            ) : (
              <select
                value={formData.periodicite}
                onChange={(e) => handleChange('periodicite', e.target.value as 'mensuelle' | 'annuelle')}
                className="w-full bg-background border border-input rounded-md px-3 py-2 text-foreground"
              >
                <option value="mensuelle">Mensuelle</option>
                <option value="annuelle">Annuelle</option>
              </select>
            )}
          </div>

          {/* Date Souscription */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Date de Souscription *
            </label>
            {mode === 'view' ? (
              <p className="text-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                {formatDate(formData.date_souscription)}
              </p>
            ) : (
              <Input
                type="date"
                value={formData.date_souscription}
                onChange={(e) => handleChange('date_souscription', e.target.value)}
                className={errors.date_souscription ? 'border-red-500' : ''}
              />
            )}
          </div>

          {/* Date Début */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Date de Début
            </label>
            {mode === 'view' ? (
              <p className="text-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                {formData.date_debut ? formatDate(formData.date_debut) : '-'}
              </p>
            ) : (
              <Input
                type="date"
                value={formData.date_debut || ''}
                onChange={(e) => handleChange('date_debut', e.target.value || undefined)}
              />
            )}
          </div>

          {/* Durée */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Durée (mois) *
            </label>
            {mode === 'view' ? (
              <p className="text-foreground">{formData.duree ? `${formData.duree} mois` : '-'}</p>
            ) : (
              <Input
                type="number"
                value={formData.duree || ''}
                onChange={(e) => handleChange('duree', parseInt(e.target.value) || undefined)}
                placeholder="12"
                min="1"
                className={errors.duree ? 'border-red-500' : ''}
              />
            )}
          </div>

          {/* État */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              État
            </label>
            {mode === 'view' ? (
              <div className="flex items-center gap-2">
                {getEtatIcon(formData.etat)}
                <p className="text-foreground capitalize">{formData.etat}</p>
              </div>
            ) : (
              <select
                value={formData.etat}
                onChange={(e) => handleChange('etat', e.target.value)}
                className="w-full bg-background border border-input rounded-md px-3 py-2 text-foreground"
              >
                <option value="planifié">Planifié</option>
                <option value="actif">Actif</option>
                <option value="résilié">Résilié</option>
                <option value="annulé">Annulé</option>
              </select>
            )}
          </div>

          {/* Date Fin */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Date de Fin
            </label>
            {mode === 'view' ? (
              <p className="text-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                {formData.date_fin ? formatDate(formData.date_fin) : '-'}
              </p>
            ) : (
              <Input
                type="date"
                value={formData.date_fin || ''}
                onChange={(e) => handleChange('date_fin', e.target.value || undefined)}
              />
            )}
          </div>
        </div>
      </div>

      {/* Options (Fixed from template, only status toggleable) */}
      <div className="bg-card/40 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-border/50 animate-slide-up" style={{ animationDelay: '0.2s' }}>
        <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
          <CheckCircle2 className="h-6 w-6 text-primary" />
          Options du Contrat
        </h2>

        {template.options && template.options.length > 0 ? (
          <div className="space-y-4">
            {template.options.map(option => {
              const isSubscribed = formData.options_souscrites.find(
                os => os.option_id === option.id
              )?.statut === 'souscrite';
              
              return (
                <div
                  key={option.id}
                  className={`bg-background/50 rounded-xl p-6 border transition-all ${
                    mode === 'edit' ? 'cursor-pointer' : ''
                  } ${
                    isSubscribed 
                      ? 'border-primary/50 shadow-lg shadow-primary/10' 
                      : 'border-border/50'
                  }`}
                  onClick={() => mode === 'edit' && toggleOption(option.id)}
                >
                  <div className="flex items-start gap-4">
                    {mode === 'edit' && (
                      <div className="mt-1">
                        {isSubscribed ? (
                          <CheckCircle2 className="h-6 w-6 text-primary" />
                        ) : (
                          <Circle className="h-6 w-6 text-muted-foreground" />
                        )}
                      </div>
                    )}
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
                      {mode === 'view' && (
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          isSubscribed 
                            ? 'bg-primary/10 text-primary'
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {isSubscribed ? 'Souscrite' : 'Non souscrite'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <p>Aucune option disponible pour ce contrat</p>
          </div>
        )}
      </div>

      {/* Financial Summary */}
      <div className="bg-card/40 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-border/50 animate-slide-up" style={{ animationDelay: '0.25s' }}>
        <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
          <DollarSign className="h-6 w-6 text-primary" />
          Récapitulatif Financier
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-background/50 rounded-xl p-6 border border-primary/50">
            <p className="text-sm text-muted-foreground mb-2">Montant Mensuel</p>
            <p className="text-3xl font-bold text-primary">
              {formatCurrency(formData.montant_mensuel)}
              <span className="text-sm text-muted-foreground font-normal">/mois</span>
            </p>
            {formData.options_souscrites && formData.options_souscrites.filter(os => os.statut === 'souscrite').length > 0 && (
              <p className="text-xs text-muted-foreground mt-2">
                Incluant {formData.options_souscrites.filter(os => os.statut === 'souscrite').length} option(s)
              </p>
            )}
          </div>

          <div className="bg-background/50 rounded-xl p-6 border border-accent/50">
            <p className="text-sm text-muted-foreground mb-2">Montant Annuel</p>
            <p className="text-3xl font-bold text-accent">
              {formatCurrency(formData.montant_annuel)}
              <span className="text-sm text-muted-foreground font-normal">/an</span>
            </p>
          </div>
        </div>
      </div>

      {/* Origin Tracking (View only) */}
      {mode === 'view' && (
        <div className="bg-card/40 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-border/50 animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div>
              <p className="text-muted-foreground mb-1">Agent Origine</p>
              <p className="text-foreground font-medium">{formData.agent_origine}</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Date Origine</p>
              <p className="text-foreground font-medium">{formatDate(formData.date_origine)}</p>
            </div>
            {formData.modified_at && (
              <div>
                <p className="text-muted-foreground mb-1">Dernière Modification</p>
                <p className="text-foreground font-medium">
                  {formatDate(formData.modified_at)} par {formData.modified_by}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Terminate Contract Dialog */}
      {showTerminateDialog && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowTerminateDialog(false)}>
          <div className="bg-card rounded-2xl p-8 shadow-2xl border border-border max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-bold text-foreground mb-6">Résilier la Souscription</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Date de fin de la souscription *
                </label>
                <Input
                  type="date"
                  value={dateFin}
                  onChange={(e) => setDateFin(e.target.value)}
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={handleConfirmTerminate} variant="destructive" className="flex-1 gap-2">
                  <XCircle className="h-4 w-4" />
                  Résilier
                </Button>
                <Button onClick={() => setShowTerminateDialog(false)} variant="outline" className="flex-1">
                  Annuler
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
