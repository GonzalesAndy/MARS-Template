import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { mockClients, type Contrat, type ContratOption } from '@/mocks/data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  ArrowLeft, 
  Save, 
  Edit, 
  Trash2, 
  X, 
  Plus,
  FileText,
  Calendar,
  DollarSign,
  CheckCircle2,
  XCircle,
  Ban,
  Clock
} from 'lucide-react';

export default function ClientContractDetailPage() {
  const { clientId, contractId } = useParams<{ clientId: string; contractId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  const client = mockClients.find(c => c.id === clientId);
  const [mode, setMode] = useState<'view' | 'edit' | 'add'>(
    location.state?.mode || (contractId === 'new' ? 'add' : 'view')
  );

  // Initialize form state
  const initialContrat: Contrat = location.state?.contrat || {
    id: '',
    client_id: clientId || '',
    code_contrat: '',
    intitule: '',
    descriptif: '',
    domaine: '',
    date_souscription: new Date().toISOString().split('T')[0],
    tarif_base: 0,
    montant_mensuel: 0,
    montant_annuel: 0,
    periodicite: 'mensuelle',
    etat: 'planifié',
    agent_origine: 'Agent Actuel',
    date_origine: new Date().toISOString().split('T')[0],
    duree: 12,
    options: [],
    date_fin: undefined,
    modified_at: undefined,
    modified_by: undefined
  };

  const [formData, setFormData] = useState<Contrat>(initialContrat);
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  
  // State for termination dialog
  const [showTerminateDialog, setShowTerminateDialog] = useState(false);
  const [dateFin, setDateFin] = useState('');

  // Recalculate amounts when options or tarif_base change
  useEffect(() => {
    const subscribedOptions = formData.options?.filter(o => o.statut === 'souscrite') || [];
    const optionsCost = subscribedOptions.reduce((sum, opt) => {
      return sum + (formData.periodicite === 'mensuelle' ? opt.prix_mensuel : opt.prix_annuel);
    }, 0);

    let montant_mensuel: number;
    let montant_annuel: number;

    if (formData.periodicite === 'mensuelle') {
      montant_mensuel = formData.tarif_base + optionsCost;
      montant_annuel = montant_mensuel * 12;
    } else {
      montant_annuel = formData.tarif_base + optionsCost;
      montant_mensuel = montant_annuel / 12;
    }

    setFormData(prev => ({
      ...prev,
      montant_mensuel,
      montant_annuel
    }));
  }, [formData.tarif_base, formData.periodicite, formData.options]);

  if (!client) {
    return (
      <div className="max-w-7xl mx-auto text-center py-20">
        <h1 className="text-3xl font-bold text-foreground mb-4">Client introuvable</h1>
        <Button onClick={() => navigate('/dashboard')}>
          Retour à la recherche
        </Button>
      </div>
    );
  }

  const handleChange = (field: keyof Contrat, value: string | number | undefined) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: false }));
  };

  const handleAddOption = () => {
    const newOption: ContratOption = {
      id: `OPT${Date.now()}`,
      nom: '',
      description: '',
      prix_mensuel: 0,
      prix_annuel: 0,
      est_gratuite: false,
      statut: 'non souscrite'
    };
    setFormData(prev => ({
      ...prev,
      options: [...(prev.options || []), newOption]
    }));
  };

  const handleRemoveOption = (index: number) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options?.filter((_, i) => i !== index) || []
    }));
  };

  const handleOptionChange = (index: number, field: keyof ContratOption, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options?.map((opt, i) => 
        i === index ? { ...opt, [field]: value } : opt
      ) || []
    }));
  };

  const toggleOptionStatus = (index: number) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options?.map((opt, i) => 
        i === index 
          ? { ...opt, statut: opt.statut === 'souscrite' ? 'non souscrite' : 'souscrite' }
          : opt
      ) || []
    }));
  };

  const handleSave = () => {
    const newErrors: Record<string, boolean> = {};
    
    if (!formData.code_contrat) newErrors.code_contrat = true;
    if (!formData.intitule) newErrors.intitule = true;
    if (!formData.domaine) newErrors.domaine = true;
    if (!formData.date_souscription) newErrors.date_souscription = true;
    if (!formData.tarif_base || formData.tarif_base <= 0) newErrors.tarif_base = true;
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const savedContrat: Contrat = {
      ...formData,
      modified_at: new Date().toISOString(),
      modified_by: 'Agent Actuel'
    };

    if (mode === 'add') {
      savedContrat.id = `CTR${Date.now()}`;
      navigate(`/client/${clientId}/contracts`, {
        state: { newContrat: savedContrat }
      });
    } else {
      navigate(`/client/${clientId}/contracts`, {
        state: { updatedContrat: savedContrat }
      });
    }
  };

  const handleDelete = () => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce contrat ?')) {
      navigate(`/client/${clientId}/contracts`, {
        state: { deletedContratId: formData.id }
      });
    }
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
    
    const terminated: Contrat = {
      ...formData,
      etat: 'résilié',
      date_fin: dateFin,
      modified_at: new Date().toISOString(),
      modified_by: 'Agent Actuel'
    };
    
    navigate(`/client/${clientId}/contracts`, {
      state: { updatedContrat: terminated }
    });
  };

  const handleCancel = () => {
    if (mode === 'add') {
      navigate(`/client/${clientId}/contracts`);
    } else if (mode === 'edit') {
      setMode('view');
      setFormData(initialContrat);
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

  const canSave = formData.code_contrat && formData.intitule && formData.domaine && 
                  formData.date_souscription && formData.tarif_base > 0;

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
              {mode === 'view' && formData.etat === 'actif' && (
                <Button variant="destructive" onClick={handleTerminate} className="gap-2">
                  <XCircle className="h-4 w-4" />
                  Résilier
                </Button>
              )}
              {mode === 'view' && (
                <Button variant="destructive" onClick={handleDelete} className="gap-2">
                  <Trash2 className="h-4 w-4" />
                  Supprimer
                </Button>
              )}
            </>
          )}
          {mode !== 'view' && (
            <>
              <Button onClick={handleCancel} variant="ghost" className="gap-2">
                <X className="h-4 w-4" />
                Annuler
              </Button>
              <Button onClick={handleSave} disabled={!canSave} className="gap-2">
                <Save className="h-4 w-4" />
                Enregistrer
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
              {mode === 'add' ? 'Nouveau Contrat' : formData.intitule || 'Contrat'}
            </h1>
            <p className="text-muted-foreground mt-2">
              Client: {client.denomination}
            </p>
            {mode === 'view' && formData.code_contrat && (
              <p className="text-sm text-muted-foreground/70 font-mono mt-1">{formData.code_contrat}</p>
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

      {/* Contract Information */}
      <div className="bg-card/40 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-border/50 animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
          <FileText className="h-6 w-6 text-primary" />
          Informations du Contrat
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Code Contrat */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Code Contrat *
            </label>
            {mode === 'view' ? (
              <p className="text-foreground font-mono">{formData.code_contrat}</p>
            ) : (
              <Input
                value={formData.code_contrat}
                onChange={(e) => handleChange('code_contrat', e.target.value)}
                placeholder="CTR001"
                className={errors.code_contrat ? 'border-red-500' : ''}
              />
            )}
          </div>

          {/* Intitulé */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Intitulé *
            </label>
            {mode === 'view' ? (
              <p className="text-foreground">{formData.intitule}</p>
            ) : (
              <Input
                value={formData.intitule}
                onChange={(e) => handleChange('intitule', e.target.value)}
                placeholder="Assurance Responsabilité Civile"
                className={errors.intitule ? 'border-red-500' : ''}
              />
            )}
          </div>

          {/* Domaine */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Domaine *
            </label>
            {mode === 'view' ? (
              <p className="text-foreground">{formData.domaine}</p>
            ) : (
              <select
                value={formData.domaine}
                onChange={(e) => handleChange('domaine', e.target.value)}
                className={`w-full bg-background border rounded-md px-3 py-2 text-foreground ${errors.domaine ? 'border-red-500' : 'border-input'}`}
              >
                <option value="">Sélectionner...</option>
                <option value="Assurance">Assurance</option>
                <option value="Téléphonie">Téléphonie</option>
                <option value="Énergie">Énergie</option>
                <option value="Internet">Internet</option>
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

          {/* Durée */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Durée (mois)
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
              />
            )}
          </div>

          {/* Periodicité */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Périodicité
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

          {/* Tarif Base */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Tarif de Base ({formData.periodicite === 'mensuelle' ? 'mensuel' : 'annuel'}) *
            </label>
            {mode === 'view' ? (
              <p className="text-foreground font-semibold flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-primary" />
                {formatCurrency(formData.tarif_base)}
              </p>
            ) : (
              <Input
                type="number"
                value={formData.tarif_base}
                onChange={(e) => handleChange('tarif_base', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                step="0.01"
                min="0"
                className={errors.tarif_base ? 'border-red-500' : ''}
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

          {/* Date Fin (only show if contract is terminated or cancelled) */}
          {(formData.etat === 'résilié' || formData.etat === 'annulé') && (
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Date de Fin *
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
                  className={!formData.date_fin ? 'border-red-500' : ''}
                />
              )}
            </div>
          )}

          {/* Description */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Description
            </label>
            {mode === 'view' ? (
              <p className="text-foreground">{formData.descriptif || '-'}</p>
            ) : (
              <textarea
                value={formData.descriptif}
                onChange={(e) => handleChange('descriptif', e.target.value)}
                placeholder="Description du contrat..."
                rows={3}
                className="w-full bg-background border border-input rounded-md px-3 py-2 text-foreground resize-none"
              />
            )}
          </div>
        </div>
      </div>

      {/* Options */}
      <div className="bg-card/40 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-border/50 animate-slide-up" style={{ animationDelay: '0.15s' }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <CheckCircle2 className="h-6 w-6 text-primary" />
            Options du Contrat
          </h2>
          {mode !== 'view' && (
            <Button onClick={handleAddOption} size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Ajouter une option
            </Button>
          )}
        </div>

        {formData.options && formData.options.length > 0 ? (
          <div className="space-y-4">
            {formData.options.map((option, index) => (
              <div 
                key={option.id}
                className={`bg-background/50 rounded-xl p-6 border transition-all ${
                  option.statut === 'souscrite' 
                    ? 'border-primary/50 shadow-lg shadow-primary/10' 
                    : 'border-border/50'
                }`}
              >
                {mode === 'view' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Nom de l'option</p>
                      <p className="font-semibold text-foreground">{option.nom}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Prix</p>
                      <div className="flex items-center gap-2">
                        {option.est_gratuite ? (
                          <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-sm font-medium">
                            Gratuite
                          </span>
                        ) : (
                          <p className="font-semibold text-foreground">
                            {formatCurrency(formData.periodicite === 'mensuelle' ? option.prix_mensuel : option.prix_annuel)}
                            <span className="text-xs text-muted-foreground">
                              /{formData.periodicite === 'mensuelle' ? 'mois' : 'an'}
                            </span>
                          </p>
                        )}
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          option.statut === 'souscrite'
                            ? 'bg-primary/10 text-primary'
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {option.statut}
                        </span>
                      </div>
                    </div>
                    {option.description && (
                      <div className="md:col-span-2">
                        <p className="text-sm text-muted-foreground mb-1">Description</p>
                        <p className="text-foreground text-sm">{option.description}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">
                          Nom de l'option
                        </label>
                        <Input
                          value={option.nom}
                          onChange={(e) => handleOptionChange(index, 'nom', e.target.value)}
                          placeholder="Protection Juridique"
                        />
                      </div>
                      <div className="flex items-end gap-2">
                        <div className="flex-1">
                          <label className="flex items-center gap-2 mb-2">
                            <input
                              type="checkbox"
                              checked={option.est_gratuite}
                              onChange={(e) => handleOptionChange(index, 'est_gratuite', e.target.checked)}
                              className="rounded border-input"
                            />
                            <span className="text-sm font-medium text-muted-foreground">
                              Option gratuite
                            </span>
                          </label>
                          {!option.est_gratuite && (
                            <Input
                              type="number"
                              value={formData.periodicite === 'mensuelle' ? option.prix_mensuel : option.prix_annuel}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value) || 0;
                                if (formData.periodicite === 'mensuelle') {
                                  handleOptionChange(index, 'prix_mensuel', val);
                                  handleOptionChange(index, 'prix_annuel', val * 12);
                                } else {
                                  handleOptionChange(index, 'prix_annuel', val);
                                  handleOptionChange(index, 'prix_mensuel', val / 12);
                                }
                              }}
                              placeholder="Prix"
                              step="0.01"
                              min="0"
                            />
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant={option.statut === 'souscrite' ? 'default' : 'outline'}
                          onClick={() => toggleOptionStatus(index)}
                          className="gap-2"
                        >
                          {option.statut === 'souscrite' ? (
                            <>
                              <CheckCircle2 className="h-4 w-4" />
                              Souscrite
                            </>
                          ) : (
                            <>
                              <XCircle className="h-4 w-4" />
                              Non souscrite
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemoveOption(index)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-2">
                        Description
                      </label>
                      <textarea
                        value={option.description}
                        onChange={(e) => handleOptionChange(index, 'description', e.target.value)}
                        placeholder="Description de l'option..."
                        rows={2}
                        className="w-full bg-background border border-input rounded-md px-3 py-2 text-foreground resize-none text-sm"
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <p>Aucune option ajoutée</p>
            {mode !== 'view' && (
              <Button onClick={handleAddOption} size="sm" className="mt-4 gap-2">
                <Plus className="h-4 w-4" />
                Ajouter la première option
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="bg-card/40 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-border/50 animate-slide-up" style={{ animationDelay: '0.2s' }}>
        <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
          <DollarSign className="h-6 w-6 text-primary" />
          Récapitulatif Financier
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-background/50 rounded-xl p-6 border border-border/50">
            <p className="text-sm text-muted-foreground mb-2">Tarif de Base</p>
            <p className="text-2xl font-bold text-foreground">
              {formatCurrency(formData.tarif_base)}
              <span className="text-sm text-muted-foreground font-normal">
                /{formData.periodicite === 'mensuelle' ? 'mois' : 'an'}
              </span>
            </p>
          </div>

          <div className="bg-background/50 rounded-xl p-6 border border-primary/50">
            <p className="text-sm text-muted-foreground mb-2">Montant Mensuel</p>
            <p className="text-2xl font-bold text-primary">
              {formatCurrency(formData.montant_mensuel)}
              <span className="text-sm text-muted-foreground font-normal">/mois</span>
            </p>
            {formData.options && formData.options.filter(o => o.statut === 'souscrite' && !o.est_gratuite).length > 0 && (
              <p className="text-xs text-muted-foreground mt-2">
                Incluant {formData.options.filter(o => o.statut === 'souscrite').length} option(s)
              </p>
            )}
          </div>

          <div className="bg-background/50 rounded-xl p-6 border border-accent/50">
            <p className="text-sm text-muted-foreground mb-2">Montant Annuel</p>
            <p className="text-2xl font-bold text-accent">
              {formatCurrency(formData.montant_annuel)}
              <span className="text-sm text-muted-foreground font-normal">/an</span>
            </p>
          </div>
        </div>
      </div>

      {/* Origin Tracking (View only) */}
      {mode === 'view' && (
        <div className="bg-card/40 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-border/50 animate-slide-up" style={{ animationDelay: '0.25s' }}>
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
            <h2 className="text-2xl font-bold text-foreground mb-6">Résilier le Contrat</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Date de fin du contrat *
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
