import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { mockClients, mockPersonnes, mockSouscriptions, mockContratsTemplates, mockContacts, type Personne, type Client } from '@/mocks/data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Building2, 
  Users, 
  FileText, 
  Phone, 
  Mail, 
  MapPin, 
  TrendingUp, 
  AlertCircle,
  Calendar,
  ArrowLeft,
  Maximize2,
  Edit,
  Save,
  X,
  Check,
  Briefcase
} from 'lucide-react';

export default function ClientDetailPage() {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  // mode: 'view' | 'edit' | 'add'
  const [mode, setMode] = useState<'view' | 'edit' | 'add'>('view');
  const [selectedPersonne, setSelectedPersonne] = useState<Personne | null>(null);
  const [formData, setFormData] = useState<Partial<Personne>>({});
  
  // Client editing state
  const [isEditingClient, setIsEditingClient] = useState(false);
  const [clientFormData, setClientFormData] = useState<Partial<Client>>({});
  
  // Available segments for selection
  const availableSegments = [
    'PME', 'Tech', 'Services', 'Conseil', 'Particulier', 'Premium',
    'Grande Entreprise', 'Immobilier', 'Standard', 'TPE', 'Commerce',
    'Jeune', 'Profession Libérale', 'Santé', 'Industrie', 'Agriculture'
  ];

  // Handle navigation state from ClientPeoplePage
  useEffect(() => {
    if (location.state?.mode) {
      setMode(location.state.mode);
    }
    if (location.state?.personne) {
      setSelectedPersonne(location.state.personne);
      setFormData(location.state.personne);
    }
    if (location.state?.mode === 'add') {
      setFormData({
        client_id: clientId,
        prenom: '',
        nom: '',
        email: '',
        telephone: '',
        role: 'Membre',
        date_naissance: new Date().toISOString().split('T')[0],
      });
    }
  }, [location.state, clientId]);
  
  const client = mockClients.find(c => c.id === clientId);
  const sortByDateDesc = <T extends { date_contact?: string; date_souscription?: string }>(arr: T[], dateKey: 'date_contact' | 'date_souscription') =>
    arr.slice().sort((a, b) => {
      const ta = (dateKey === 'date_contact' ? a.date_contact : a.date_souscription) ? new Date((dateKey === 'date_contact' ? a.date_contact : a.date_souscription) as string).getTime() : 0;
      const tb = (dateKey === 'date_contact' ? b.date_contact : b.date_souscription) ? new Date((dateKey === 'date_contact' ? b.date_contact : b.date_souscription) as string).getTime() : 0;
      return tb - ta;
    });

  const clientPersonnes = mockPersonnes.filter(p => p.client_id === clientId);
  const clientSouscriptions = sortByDateDesc(mockSouscriptions.filter(c => c.client_id === clientId), 'date_souscription');
  const clientContacts = sortByDateDesc(mockContacts.filter(c => c.client_id === clientId), 'date_contact');
  
  // Initialize client form data when entering edit mode
  useEffect(() => {
    if (isEditingClient && client) {
      setClientFormData(client);
    }
  }, [isEditingClient, client]);

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

  // Calculate contract stats by domain
  const contractsByDomain = clientSouscriptions.reduce((acc, souscription) => {
    const template = mockContratsTemplates.find(t => t.id === souscription.contrat_template_id);
    if (!template) return acc;
    
    if (!acc[template.domaine]) {
      acc[template.domaine] = { count: 0, lastSubscription: souscription.date_souscription };
    }
    acc[template.domaine].count++;
    if (souscription.date_souscription > acc[template.domaine].lastSubscription) {
      acc[template.domaine].lastSubscription = souscription.date_souscription;
    }
    return acc;
  }, {} as Record<string, { count: number; lastSubscription: string }>);

  // All contract domains available in mock templates and existing client contracts
  const allContractDomains = Array.from(new Set([
    ...mockContratsTemplates.map(t => t.domaine),
    ...Object.keys(contractsByDomain),
  ]));

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Faible': return 'text-green-500';
      case 'Modéré': return 'text-yellow-500';
      case 'Élevé': return 'text-red-500';
      default: return 'text-muted-foreground';
    }
  };

  const getReciprocity = (reciprocity: number) => {
    if (reciprocity >= 80) return 'Élevée';
    if (reciprocity >= 60) return 'Moyenne';
    return 'Faible';
  };

  const getPotentialColor = (potentiel: number) => {
    if (potentiel >= 80) return 'text-green-500';
    if (potentiel >= 60) return 'text-yellow-500';
    return 'text-orange-500';
  };

  const handleSave = () => {
    if (mode === 'add') {
      // Create new personne
      const newPersonne: Personne = {
        id: `PER${Date.now()}`,
        client_id: clientId || '',
        prenom: formData.prenom || '',
        nom: formData.nom || '',
        date_naissance: formData.date_naissance || new Date().toISOString().split('T')[0],
        email: formData.email || '',
        telephone: formData.telephone || '',
        role: formData.role || 'Membre',
        situation_familiale: formData.situation_familiale,
        adresse: formData.adresse,
        revenus: formData.revenus,
        charges: formData.charges,
        profession: formData.profession,
        fiscalite: formData.fiscalite,
        modified_at: new Date().toISOString(),
        modified_by: 'Agent (Vous)'
      };
      navigate(`/client/${clientId}/people`, {
        state: { newPersonne },
        replace: true
      });
    } else if (mode === 'edit' && selectedPersonne) {
      // Update existing personne
      const updatedPersonne: Personne = {
        ...selectedPersonne,
        ...formData,
        modified_at: new Date().toISOString(),
        modified_by: 'Agent (Vous)'
      };
      navigate(`/client/${clientId}/people`, {
        state: { updatedPersonne },
        replace: true
      });
    }
  };

  const handleCancel = () => {
    if (mode === 'view') {
      navigate(`/client/${clientId}/people`);
    } else {
      setMode('view');
      if (selectedPersonne) {
        setFormData(selectedPersonne);
      }
    }
  };

  const handleDelete = () => {
    if (selectedPersonne && window.confirm(`Êtes-vous sûr de vouloir supprimer ${selectedPersonne.prenom} ${selectedPersonne.nom} ?\n\nCette action est irréversible.`)) {
      navigate(`/client/${clientId}/people`, {
        state: { deletedPersonneId: selectedPersonne.id },
        replace: true
      });
    }
  };

  // Client editing handlers
  const handleClientEdit = () => {
    setIsEditingClient(true);
  };

  const handleClientSave = () => {
    // In a real app, this would update the backend
    // For now, we'll just exit edit mode
    console.log('Saving client data:', clientFormData);
    setIsEditingClient(false);
  };

  const handleClientCancel = () => {
    setIsEditingClient(false);
    setClientFormData({});
  };

  const handleClientChange = (field: keyof Client, value: string | boolean | string[]) => {
    setClientFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleSegment = (segment: string) => {
    const currentSegments = clientFormData.segments || client?.segments || [];
    if (currentSegments.includes(segment)) {
      handleClientChange('segments', currentSegments.filter(s => s !== segment));
    } else {
      handleClientChange('segments', [...currentSegments, segment]);
    }
  };

  const displayClient = isEditingClient ? { ...client, ...clientFormData } : client;

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      {/* Back Button / Action Bar */}
      {mode === 'view' && !selectedPersonne ? (
        <Button 
          variant="ghost" 
          onClick={() => navigate('/dashboard')}
          className="mb-4 hover:bg-accent/50"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour à la recherche
        </Button>
      ) : mode === 'view' && selectedPersonne ? (
        <div className="flex items-center justify-between mb-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate(`/client/${clientId}/people`)}
            className="hover:bg-accent/50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour à la liste des membres
          </Button>
          <div className="flex gap-2">
            <Button onClick={() => setMode('edit')}>
              <Mail className="h-4 w-4 mr-2" />
              Modifier
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Supprimer
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-foreground">
            {mode === 'add' ? 'Ajouter un nouveau membre' : `Modifier - ${selectedPersonne?.prenom} ${selectedPersonne?.nom}`}
          </h2>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancel}>
              Annuler
            </Button>
            {mode === 'edit' && (
              <Button variant="destructive" onClick={handleDelete}>
                Supprimer
              </Button>
            )}
            <Button 
              onClick={handleSave}
              disabled={!formData.prenom || !formData.nom || !formData.email}
            >
              {mode === 'add' ? 'Ajouter' : 'Valider'}
            </Button>
          </div>
        </div>
      )}

      {/* Client Header Section - Only show in view mode without selected person */}
      {mode === 'view' && !selectedPersonne && (
      <div className="bg-card/40 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-border/50 animate-slide-up">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Building2 className="h-8 w-8 text-primary" />
            </div>
            <div>
              {isEditingClient ? (
                <div className="space-y-2">
                  <Input
                    value={displayClient?.denomination || ''}
                    onChange={(e) => handleClientChange('denomination', e.target.value)}
                    className="text-2xl font-bold h-auto py-2"
                    placeholder="Dénomination"
                  />
                  <p className="text-sm text-muted-foreground font-mono">{client.numero_client}</p>
                </div>
              ) : (
                <>
                  <h1 className="text-3xl font-bold text-foreground mb-1">{client.denomination}</h1>
                  <p className="text-sm text-muted-foreground font-mono">{client.numero_client}</p>
                </>
              )}
            </div>
          </div>
          
          <div className="flex items-start gap-2">
            {!isEditingClient ? (
              <>
                <div className="flex gap-2 flex-wrap justify-end">
                  {client.segments.map((segment, idx) => (
                    <span 
                      key={idx}
                      className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-medium text-primary"
                    >
                      {segment}
                    </span>
                  ))}
                </div>
                <Button size="sm" variant="outline" onClick={handleClientEdit} className="gap-2 ml-2">
                  <Edit className="h-4 w-4" />
                  Modifier
                </Button>
              </>
            ) : (
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={handleClientCancel} className="gap-2">
                  <X className="h-4 w-4" />
                  Annuler
                </Button>
                <Button size="sm" onClick={handleClientSave} className="gap-2">
                  <Save className="h-4 w-4" />
                  Valider
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-muted-foreground mt-1" />
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-1">Adresse</p>
              {isEditingClient ? (
                <Input
                  value={displayClient?.adresse_principale || ''}
                  onChange={(e) => handleClientChange('adresse_principale', e.target.value)}
                  placeholder="Adresse principale"
                />
              ) : (
                <p className="text-foreground">{client.adresse_principale}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <Building2 className="h-5 w-5 text-muted-foreground mt-1" />
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-1">Type</p>
                <p className="text-foreground">{client.is_personne_morale ? 'Personne Morale' : 'Particulier'}</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <Users className="h-5 w-5 text-muted-foreground mt-1" />
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-1">Agence</p>
                <p className="text-foreground">{client.agence}</p>
              <p className="text-xs text-muted-foreground mt-1">Conseiller:</p>
                <p className="text-foreground text-sm">{client.conseiller_referent}</p>
            </div>
          </div>
        </div>

        {/* Segments Section */}
        {isEditingClient && (
          <div className="border-t border-border/30 pt-6">
            <div className="flex items-center gap-2 mb-3">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-medium text-muted-foreground">Segments</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {availableSegments.map((segment) => {
                const isSelected = (displayClient?.segments || []).includes(segment);
                return (
                  <button
                    key={segment}
                    onClick={() => toggleSegment(segment)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all border ${
                      isSelected
                        ? 'bg-primary/10 border-primary/20 text-primary'
                        : 'bg-background border-border/50 text-muted-foreground hover:border-primary/30'
                    }`}
                  >
                    {isSelected && <Check className="h-3 w-3 inline mr-1" />}
                    {segment}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
      )}

      {/* Edit/Add Form Section */}
      {(mode === 'edit' || mode === 'add') && (
        <div className="bg-card/40 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-border/50 animate-slide-up">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contract quick summary (from mock data) */}
            <div className="md:col-span-2 grid grid-cols-2 gap-4 mb-4">
              {allContractDomains.map((domain) => {
                const stats = contractsByDomain[domain];
                return (
                  <div key={domain} className="p-3 rounded-lg bg-background/50 border border-border/30">
                    <p className="text-sm text-muted-foreground mb-1">{domain}</p>
                    <p className="text-2xl font-bold text-foreground mb-1">{stats?.count ?? 0}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>Dernier: {stats && stats.lastSubscription ? new Date(stats.lastSubscription).toLocaleDateString('fr-FR') : 'N/A'}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Informations Personnelles
              </h3>
              
              <div className="space-y-1">
                <label className="text-sm font-medium text-muted-foreground">Prénom *</label>
                <Input
                  value={formData.prenom || ''}
                  onChange={(e) => setFormData({...formData, prenom: e.target.value})}
                  placeholder="Prénom"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Nom *</label>
                <Input
                  value={formData.nom || ''}
                  onChange={(e) => setFormData({...formData, nom: e.target.value})}
                  placeholder="Nom"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Email *</label>
                <Input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="Email"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Téléphone</label>
                <Input
                  value={formData.telephone || ''}
                  onChange={(e) => setFormData({...formData, telephone: e.target.value})}
                  placeholder="Téléphone"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Date de naissance</label>
                <Input
                  type="date"
                  value={formData.date_naissance || ''}
                  onChange={(e) => setFormData({...formData, date_naissance: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Situation familiale</label>
                <Input
                  value={formData.situation_familiale || ''}
                  onChange={(e) => setFormData({...formData, situation_familiale: e.target.value})}
                  placeholder="Situation familiale"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Adresse</label>
                <Input
                  value={formData.adresse || ''}
                  onChange={(e) => setFormData({...formData, adresse: e.target.value})}
                  placeholder="Adresse du membre"
                />
              </div>
            </div>

            {/* Professional & Financial Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Informations Professionnelles & Financières
              </h3>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Rôle</label>
                <Input
                  value={formData.role || ''}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  placeholder="Rôle"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Profession</label>
                <Input
                  value={formData.profession || ''}
                  onChange={(e) => setFormData({...formData, profession: e.target.value})}
                  placeholder="Profession"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Revenus mensuels (€)</label>
                <Input
                  type="number"
                  value={formData.revenus || ''}
                  onChange={(e) => setFormData({...formData, revenus: Number(e.target.value)})}
                  placeholder="Revenus"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Charges mensuelles (€)</label>
                <Input
                  type="number"
                  value={formData.charges || ''}
                  onChange={(e) => setFormData({...formData, charges: Number(e.target.value)})}
                  placeholder="Charges"
                />
              </div>

              {formData.revenus && formData.charges && (
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <label className="text-sm text-muted-foreground">Capacité d'épargne estimée</label>
                  <p className="text-2xl font-bold text-primary mt-1">
                    {(formData.revenus - formData.charges).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                  </p>
                </div>
              )}

              {/* Fiscalité Section */}
              <div className="pt-4 border-t border-border/30">
                <h4 className="text-sm font-semibold text-foreground mb-3">Fiscalité</h4>
                
                <div className="space-y-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Régime fiscal</label>
                    <Input
                      value={formData.fiscalite?.regime_fiscal || ''}
                      onChange={(e) => setFormData({
                        ...formData, 
                        fiscalite: { ...formData.fiscalite, regime_fiscal: e.target.value }
                      })}
                      placeholder="Ex: Régime réel, Micro-entreprise"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Taux d'imposition (%)</label>
                    <Input
                      type="number"
                      value={formData.fiscalite?.taux_imposition || ''}
                      onChange={(e) => setFormData({
                        ...formData, 
                        fiscalite: { ...formData.fiscalite, taux_imposition: Number(e.target.value) }
                      })}
                      placeholder="Taux en %"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Nombre de parts</label>
                    <Input
                      type="number"
                      step="0.5"
                      value={formData.fiscalite?.nombre_parts || ''}
                      onChange={(e) => setFormData({
                        ...formData, 
                        fiscalite: { ...formData.fiscalite, nombre_parts: Number(e.target.value) }
                      })}
                      placeholder="Ex: 1, 1.5, 2"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Revenus imposables (€)</label>
                    <Input
                      type="number"
                      value={formData.fiscalite?.revenus_imposables || ''}
                      onChange={(e) => setFormData({
                        ...formData, 
                        fiscalite: { ...formData.fiscalite, revenus_imposables: Number(e.target.value) }
                      })}
                      placeholder="Revenus imposables"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Person Details View - Only show when viewing a specific person */}
      {mode === 'view' && selectedPersonne && (
        <div className="bg-card/40 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-border/50 animate-slide-up">
          <div className="mb-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">{selectedPersonne.prenom} {selectedPersonne.nom}</h1>
                <p className="text-primary mt-1">{selectedPersonne.role}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Personal Information */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Informations Personnelles
                </h3>
                <div className="space-y-4 bg-background/50 rounded-lg p-4 border border-border/30">
                  <div>
                    <label className="text-sm text-muted-foreground">Date de naissance</label>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <p className="text-foreground">{new Date(selectedPersonne.date_naissance).toLocaleDateString('fr-FR')}</p>
                    </div>
                  </div>
                  
                  {selectedPersonne.situation_familiale && (
                    <div>
                      <label className="text-sm text-muted-foreground">Situation familiale</label>
                      <p className="text-foreground mt-1">{selectedPersonne.situation_familiale}</p>
                    </div>
                  )}

                  {selectedPersonne.adresse && (
                    <div>
                      <label className="text-sm text-muted-foreground">Adresse</label>
                      <p className="text-foreground mt-1">{selectedPersonne.adresse}</p>
                    </div>
                  )}

                  <div>
                    <label className="text-sm text-muted-foreground">Email</label>
                    <div className="flex items-center gap-2 mt-1">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <p className="text-foreground">{selectedPersonne.email}</p>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-muted-foreground">Téléphone</label>
                    <div className="flex items-center gap-2 mt-1">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <p className="text-foreground">{selectedPersonne.telephone}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Professional Information */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Informations Professionnelles
                </h3>
                <div className="space-y-4 bg-background/50 rounded-lg p-4 border border-border/30">
                  <div>
                    <label className="text-sm text-muted-foreground">Profession</label>
                    <p className="text-foreground mt-1">{selectedPersonne.profession || 'Non renseigné'}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm text-muted-foreground">Rôle</label>
                    <p className="text-foreground mt-1">{selectedPersonne.role}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Financial Information */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Informations Financières
                </h3>
                <div className="space-y-4 bg-background/50 rounded-lg p-4 border border-border/30">
                  <div>
                    <label className="text-sm text-muted-foreground">Revenus mensuels</label>
                    <p className="text-foreground mt-1 text-xl font-semibold">
                      {selectedPersonne.revenus ? selectedPersonne.revenus.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' }) : 'N/A'}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm text-muted-foreground">Charges mensuelles</label>
                    <p className="text-foreground mt-1 text-xl font-semibold">
                      {selectedPersonne.charges ? selectedPersonne.charges.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' }) : 'N/A'}
                    </p>
                  </div>

                  {selectedPersonne.revenus && selectedPersonne.charges && (
                    <div className="pt-4 border-t border-border/30">
                      <label className="text-sm text-muted-foreground">Capacité d'épargne</label>
                      <p className="text-primary mt-1 text-xl font-bold">
                        {(selectedPersonne.revenus - selectedPersonne.charges).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Fiscalité */}
              {selectedPersonne.fiscalite && (
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Fiscalité
                  </h3>
                  <div className="space-y-4 bg-background/50 rounded-lg p-4 border border-border/30">
                    {selectedPersonne.fiscalite.regime_fiscal && (
                      <div>
                        <label className="text-sm text-muted-foreground">Régime fiscal</label>
                        <p className="text-foreground mt-1">{selectedPersonne.fiscalite.regime_fiscal}</p>
                      </div>
                    )}

                    {selectedPersonne.fiscalite.taux_imposition !== undefined && (
                      <div>
                        <label className="text-sm text-muted-foreground">Taux d'imposition</label>
                        <p className="text-foreground mt-1 text-xl font-semibold">{selectedPersonne.fiscalite.taux_imposition}%</p>
                      </div>
                    )}

                    {selectedPersonne.fiscalite.nombre_parts !== undefined && (
                      <div>
                        <label className="text-sm text-muted-foreground">Nombre de parts</label>
                        <p className="text-foreground mt-1">{selectedPersonne.fiscalite.nombre_parts}</p>
                      </div>
                    )}

                    {selectedPersonne.fiscalite.revenus_imposables !== undefined && (
                      <div>
                        <label className="text-sm text-muted-foreground">Revenus imposables</label>
                        <p className="text-foreground mt-1 text-xl font-semibold">
                          {selectedPersonne.fiscalite.revenus_imposables.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Modification Info - Bottom Right */}
          <div className="mt-6 flex justify-end">
            <p className="text-xs text-muted-foreground">
              Dernière modification: {new Date(selectedPersonne.modified_at).toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
              })} à {new Date(selectedPersonne.modified_at).toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit'
              })} par {selectedPersonne.modified_by}
            </p>
          </div>
        </div>
      )}

      {/* Customer/People Area - Only show in view mode without selected person */}
      {mode === 'view' && !selectedPersonne && (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* People List */}
        <div className="bg-card/40 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-border/50 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">Membres ({clientPersonnes.length})</h2>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate(`/client/${clientId}/people`)}
              className="hover:bg-accent/50"
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-4">
            {clientPersonnes.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Aucun membre enregistré</p>
            ) : (
              clientPersonnes.map((personne) => (
                <div key={personne.id} className="p-4 rounded-lg bg-background/50 border border-border/30">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium text-foreground">{personne.prenom} {personne.nom}</p>
                      <p className="text-xs text-primary">{personne.role}</p>
                    </div>
                  </div>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    {personne.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-3 w-3" />
                        <span>{personne.email}</span>
                      </div>
                    )}
                    {personne.telephone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-3 w-3" />
                        <span>{personne.telephone}</span>
                      </div>
                    )}
                    {personne.profession && (
                      <p className="mt-2">Profession: {personne.profession}</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Customer Ratings */}
        <div className="bg-card/40 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-border/50 animate-slide-up" style={{ animationDelay: '0.15s' }}>
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold text-foreground">Indicateurs</h2>
          </div>
          <div className="space-y-6">
            {/* Risk Indicator */}
            <div className="p-4 rounded-lg bg-background/50 border border-border/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Niveau de Risque</span>
                <AlertCircle className={`h-5 w-5 ${getRiskColor(client.risque)}`} />
              </div>
              <p className={`text-2xl font-bold ${getRiskColor(client.risque)}`}>{client.risque}</p>
            </div>

            {/* Potential Indicator */}
            <div className="p-4 rounded-lg bg-background/50 border border-border/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Potentiel</span>
                <TrendingUp className={`h-5 w-5 ${getPotentialColor(client.potentiel)}`} />
              </div>
              <div className="flex items-end gap-2">
                <p className={`text-2xl font-bold ${getPotentialColor(client.potentiel)}`}>{client.potentiel}</p>
                <span className="text-sm text-muted-foreground mb-1">/ 100</span>
              </div>
              <div className="mt-2 w-full bg-muted/30 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-primary to-accent h-2 rounded-full transition-all"
                  style={{ width: `${client.potentiel}%` }}
                />
              </div>
            </div>

            {/* Total Balance */}
            <div className="p-4 rounded-lg bg-background/50 border border-border/30">
              <p className="text-sm text-muted-foreground mb-2">Solde Total</p>
              <p className="text-2xl font-bold text-foreground">
                {client.solde_total.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
              </p>
            </div>

            {/* Reciprocity */}
            <div className="p-4 rounded-lg bg-background/50 border border-border/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Reciprocité</span>
                <AlertCircle className={`h-5 w-5 ${getReciprocity(client.reciprocity ?? 0)}`} />
              </div>
              <p className={`text-2xl font-bold ${getReciprocity(client.reciprocity ?? 0)}`}>{getReciprocity(client.reciprocity ?? 0)}</p>
            </div>
            {/* Cotation */}
            {client.cotation && (
              <div className="p-4 rounded-lg bg-background/50 border border-border/30">
                <p className="text-sm text-muted-foreground mb-2">Cotation</p>
                <p className="text-2xl font-bold text-primary font-mono">{client.cotation}</p>
              </div>
            )}
          </div>
        </div>
      </div>
      )}

      {/* Contracts Area - Only show in view mode without selected person */}
      {mode === 'view' && !selectedPersonne && (
      <div className="bg-card/40 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-border/50 animate-slide-up" style={{ animationDelay: '0.2s' }}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold text-foreground">Contrats ({client?.nombre_contrats})</h2>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate(`/client/${clientId}/contracts`)}
            className="gap-2"
          >
            <Maximize2 className="h-4 w-4" />
            Gérer les contrats
          </Button>
        </div>

        {/* Contract Summary by Domain */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {allContractDomains.map((domain) => {
            const stats = contractsByDomain[domain];
            return (
              <div key={domain} className="p-4 rounded-lg bg-background/50 border border-border/30">
                <p className="text-sm text-muted-foreground mb-1">{domain}</p>
                <p className="text-2xl font-bold text-foreground mb-2">{stats?.count ?? 0}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>Dernier: {stats && stats.lastSubscription ? new Date(stats.lastSubscription).toLocaleDateString('fr-FR') : 'N/A'}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Contracts Table */}
        {clientSouscriptions.length > 0 && (
          <div className="overflow-x-auto rounded-lg border border-border/30">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead className="text-xs uppercase tracking-wider">Code</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider">Intitulé</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider">Domaine</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider">État</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider">Montant Annuel</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider">Date Souscription</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clientSouscriptions.map((souscription) => {
                  const template = mockContratsTemplates.find(t => t.id === souscription.contrat_template_id);
                  if (!template) return null;
                  
                  return (
                    <TableRow key={souscription.id} className="hover:bg-accent/10">
                      <TableCell className="font-mono text-xs">{souscription.code_souscription}</TableCell>
                      <TableCell className="font-medium">{template.intitule}</TableCell>
                      <TableCell>
                        <span className="px-2 py-1 rounded-full bg-primary/10 text-xs text-primary">
                          {template.domaine}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          souscription.etat === 'actif' ? 'bg-green-500/10 text-green-500' :
                          souscription.etat === 'planifié' ? 'bg-blue-500/10 text-blue-500' :
                          'bg-gray-500/10 text-gray-500'
                        }`}>
                          {souscription.etat}
                        </span>
                      </TableCell>
                      <TableCell className="font-semibold">
                        {souscription.montant_annuel.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(souscription.date_souscription).toLocaleDateString('fr-FR')}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
      )}

      {/* Bank/Customer Relationship Area - Only show in view mode without selected person */}
      {mode === 'view' && !selectedPersonne && (
      <div className="bg-card/40 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-border/50 animate-slide-up" style={{ animationDelay: '0.25s' }}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Phone className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold text-foreground">Historique des Interactions</h2>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate(`/client/${clientId}/contacts`)}
            className="hover:bg-accent/50"
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>

        {clientContacts.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">Aucun contact enregistré</p>
        ) : (
          <div className="space-y-4">
            {clientContacts.map((contact) => (
              <div key={contact.id} className="p-4 rounded-lg bg-background/50 border border-border/30">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      contact.etat === 'réalisé' ? 'bg-green-500' :
                      contact.etat === 'planifié' ? 'bg-blue-500' :
                      'bg-gray-500'
                    }`} />
                    <div>
                      <p className="font-medium text-foreground">{contact.motif}</p>
                      <p className="text-xs text-muted-foreground">Type: {contact.type}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    contact.etat === 'réalisé' ? 'bg-green-500/10 text-green-500' :
                    contact.etat === 'planifié' ? 'bg-blue-500/10 text-blue-500' :
                    'bg-gray-500/10 text-gray-500'
                  }`}>
                    {contact.etat}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground mt-3">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{new Date(contact.date_contact).toLocaleString('fr-FR', { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    <span>{contact.agent}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {client.derniere_interaction && (
          <div className="mt-6 p-4 rounded-lg bg-primary/5 border border-primary/20">
            <p className="text-sm text-muted-foreground">Dernière interaction</p>
            <p className="text-foreground font-medium">
              {new Date(client.derniere_interaction).toLocaleDateString('fr-FR', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
        )}
      </div>
      )}
    </div>
  );
}
