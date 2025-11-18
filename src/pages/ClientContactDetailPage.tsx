import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useState, useMemo, useEffect } from 'react';
import { mockClients, mockContacts, type Contact, type Offer, AVAILABLE_CONTRATS, AVAILABLE_PRODUITS } from '@/mocks/data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  ArrowLeft, 
  Save, 
  Edit, 
  Trash2, 
  X, 
  Plus,
  Phone,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  CalendarPlus,
  PackagePlus
} from 'lucide-react';

export default function ClientContactDetailPage() {
  const { clientId, contactId } = useParams<{ clientId: string; contactId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  const client = mockClients.find(c => c.id === clientId);
  const [mode, setMode] = useState<'view' | 'edit' | 'add' | 'realiser'>(
    location.state?.mode || (contactId === 'new' ? 'add' : 'view')
  );

  // Find parent contact if exists
  const parentContact = useMemo(() => {
    if (!location.state?.contact?.parent_contact_id) return null;
    return mockContacts.find(c => c.id === location.state.contact.parent_contact_id);
  }, [location.state?.contact?.parent_contact_id]);

  // Initialize form state
  const initialContact: Contact = location.state?.contact || {
    id: '',
    client_id: clientId || '',
    type: location.state?.type || 'commercial',
    motif: '',
    date_contact: new Date().toISOString().split('T')[0],
    etat: 'réalisé',
    agent: 'Agent Actuel',
    created_at: new Date().toISOString(),
    modified_at: new Date().toISOString()
  };

  const [formData, setFormData] = useState<Contact>(initialContact);
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  // Update formData when contactId changes (navigation between contacts)
  useEffect(() => {
    if (location.state?.contact) {
      setFormData(location.state.contact);
      setMode(location.state?.mode || 'view');
    }
  }, [contactId, location.state]);

  // Find child contacts (contacts that have this contact as parent)
  const childContacts = useMemo(() => {
    if (!formData.id) return [];
    return mockContacts.filter(c => c.parent_contact_id === formData.id);
  }, [formData.id]);
  
  // State for planning an entretien
  const [showPlanEntretien, setShowPlanEntretien] = useState(false);
  const [entretienMotif, setEntretienMotif] = useState('');
  const [entretienDate, setEntretienDate] = useState(new Date().toISOString().split('T')[0]);

  // State for realizing an entretien
  const [showOfferSelection, setShowOfferSelection] = useState(false);
  const [offerType, setOfferType] = useState<'contrat' | 'produit'>('contrat');
  const [selectedOffer, setSelectedOffer] = useState('');
  const [offerAnnotation, setOfferAnnotation] = useState('');
  
  // State for concluding entretien
  const [showConclureDialog, setShowConclureDialog] = useState(false);
  const [commentaireCloture, setCommentaireCloture] = useState('');

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

  const handleChange = (field: keyof Contact, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: false }));
  };

  const handleSave = () => {
    const newErrors: Record<string, boolean> = {};
    
    if (!formData.motif) newErrors.motif = true;
    if (!formData.date_contact) newErrors.date_contact = true;
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const savedContact: Contact = {
      ...formData,
      modified_at: new Date().toISOString(),
      modified_by: 'Agent Actuel'
    };

    if (mode === 'add') {
      savedContact.id = `CNT${Date.now()}`;
      savedContact.created_at = new Date().toISOString();
      navigate(`/client/${clientId}/contacts`, {
        state: { newContact: savedContact }
      });
    } else {
      navigate(`/client/${clientId}/contacts`, {
        state: { updatedContact: savedContact }
      });
    }
  };

  const handleDelete = () => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce contact ?')) {
      navigate(`/client/${clientId}/contacts`, {
        state: { deletedContactId: formData.id }
      });
    }
  };

  const handleCancel = () => {
    if (mode === 'add') {
      navigate(`/client/${clientId}/contacts`);
    } else {
      setMode('view');
      setFormData(initialContact);
      setErrors({});
      setShowOfferSelection(false);
    }
  };

  const handleAnnulerEntretien = () => {
    if (confirm('Êtes-vous sûr de vouloir annuler cet entretien ?')) {
      const cancelled: Contact = {
        ...formData,
        etat: 'annulé',
        modified_at: new Date().toISOString(),
        modified_by: 'Agent Actuel'
      };
      navigate(`/client/${clientId}/contacts`, {
        state: { updatedContact: cancelled }
      });
    }
  };

  const handlePlanifierEntretien = () => {
    if (!entretienMotif || !entretienDate) {
      alert('Veuillez renseigner le motif et la date de l\'entretien');
      return;
    }

    const newEntretien: Contact = {
      id: `CNT${Date.now()}`,
      client_id: clientId || '',
      type: 'entretien',
      motif: entretienMotif,
      date_contact: entretienDate,
      etat: 'planifié',
      agent: 'Agent Actuel',
      parent_contact_id: formData.id,
      created_at: new Date().toISOString(),
      modified_at: new Date().toISOString(),
      modified_by: 'Agent Actuel'
    };

    // If we're in realiser mode, just close the modal and stay on the page
    if (mode === 'realiser') {
      setShowPlanEntretien(false);
      setEntretienMotif('');
      setEntretienDate(new Date().toISOString().split('T')[0]);
      alert('Entretien planifié avec succès !');
      // In a real app, you would save this to the backend here
      return;
    }

    // Otherwise, navigate to contacts list
    navigate(`/client/${clientId}/contacts`, {
      state: { newContact: newEntretien }
    });
  };

  const handleRealiserEntretien = () => {
    setMode('realiser');
    setShowOfferSelection(false);
  };

  const handleAddOffer = () => {
    if (!selectedOffer) {
      alert('Veuillez sélectionner une offre');
      return;
    }

    const newOffer: Offer = {
      id: `OFF${Date.now()}`,
      type: offerType,
      nom: selectedOffer,
      annotation: offerAnnotation,
      statut: 'proposé'
    };

    setFormData(prev => ({
      ...prev,
      offers: [...(prev.offers || []), newOffer]
    }));

    // Reset form
    setSelectedOffer('');
    setOfferAnnotation('');
    setShowOfferSelection(false);
  };

  const handleRemoveOffer = (index: number) => {
    setFormData(prev => ({
      ...prev,
      offers: prev.offers?.filter((_, i) => i !== index) || []
    }));
  };

  const handleConclureEntretien = () => {
    setShowConclureDialog(true);
  };

  const handleConfirmCloture = () => {
    if (!commentaireCloture.trim()) {
      alert('Veuillez saisir un commentaire de clôture');
      return;
    }

    const realized: Contact = {
      ...formData,
      etat: 'réalisé',
      commentaire_cloture: commentaireCloture,
      modified_at: new Date().toISOString(),
      modified_by: 'Agent Actuel'
    };

    navigate(`/client/${clientId}/contacts`, {
      state: { updatedContact: realized }
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const getEtatIcon = (etat: string) => {
    switch (etat) {
      case 'réalisé': return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'planifié': return <Clock className="h-5 w-5 text-blue-500" />;
      case 'annulé': return <XCircle className="h-5 w-5 text-red-500" />;
      default: return null;
    }
  };

  const getEtatColor = (etat: string) => {
    switch (etat) {
      case 'réalisé': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'planifié': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'annulé': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  const canSave = formData.motif && formData.date_contact;
  const isEntretien = formData.type === 'entretien';
  const isEntretienPlanifie = isEntretien && formData.etat === 'planifié';

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button 
          variant="ghost" 
          onClick={() => navigate(`/client/${clientId}/contacts`)}
          className="hover:bg-accent/50"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour à la liste
        </Button>

        <div className="flex gap-2">
          {mode === 'view' && (
            <>
              <Button onClick={() => setMode('edit')} className="gap-2" variant="outline">
                <Edit className="h-4 w-4" />
                Modifier
              </Button>
              
              <Button onClick={() => setShowPlanEntretien(true)} className="gap-2">
                <CalendarPlus className="h-4 w-4" />
                Planifier un Entretien
              </Button>
              
              {isEntretienPlanifie && (
                <>
                  <Button onClick={handleRealiserEntretien} className="gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    Réaliser l'Entretien
                  </Button>
                  <Button onClick={handleAnnulerEntretien} variant="destructive" className="gap-2">
                    <XCircle className="h-4 w-4" />
                    Annuler
                  </Button>
                </>
              )}
              
              {mode === 'view' && contactId !== 'new' && (
                <Button variant="destructive" onClick={handleDelete} className="gap-2">
                  <Trash2 className="h-4 w-4" />
                  Supprimer
                </Button>
              )}
            </>
          )}
          
          {(mode === 'edit' || mode === 'add') && (
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
          
          {mode === 'realiser' && (
            <>
              {/* <Button onClick={() => setShowPlanEntretien(true)} className="gap-2" variant="outline">
                <CalendarPlus className="h-4 w-4" />
                Planifier un Entretien
              </Button> */}
              <Button onClick={() => setMode('view')} variant="ghost" className="gap-2">
                <X className="h-4 w-4" />
                Annuler
              </Button>
              <Button onClick={handleConclureEntretien} className="gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Conclure l'Entretien
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Title */}
      <div className="bg-card/40 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-border/50 animate-slide-up">
        <div className="flex items-center gap-4">
          <Phone className="h-10 w-10 text-primary" />
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-foreground">
              {mode === 'add' ? `Nouveau Contact ${formData.type === 'commercial' ? 'Commercial' : 'Spontané'}` : formData.motif || 'Contact'}
            </h1>
            <p className="text-muted-foreground mt-2">
              Client: {client.denomination}
            </p>
            <p className="text-sm text-muted-foreground/70 capitalize mt-1">
              Type: {formData.type}
            </p>
          </div>
          {mode === 'view' && (
            <span className={`px-4 py-2 rounded-full border text-sm font-medium flex items-center gap-2 capitalize ${getEtatColor(formData.etat)}`}>
              {getEtatIcon(formData.etat)}
              {formData.etat}
            </span>
          )}
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-card/40 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-border/50 animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
          <Phone className="h-6 w-6 text-primary" />
          Informations du Contact
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Motif */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Motif *
            </label>
            {mode === 'view' || mode === 'realiser' ? (
              <p className="text-foreground">{formData.motif}</p>
            ) : (
              <Input
                value={formData.motif}
                onChange={(e) => handleChange('motif', e.target.value)}
                placeholder="Motif du contact"
                className={errors.motif ? 'border-red-500' : ''}
              />
            )}
          </div>

          {/* Date Contact */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Date du Contact *
            </label>
            {mode === 'view' || mode === 'realiser' ? (
              <p className="text-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                {formatDate(formData.date_contact)}
              </p>
            ) : (
              <Input
                type="date"
                value={formData.date_contact}
                onChange={(e) => handleChange('date_contact', e.target.value)}
                className={errors.date_contact ? 'border-red-500' : ''}
              />
            )}
          </div>

          {/* Agent */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Agent
            </label>
            <p className="text-foreground">{formData.agent}</p>
          </div>
        </div>
      </div>

      {/* Parent Contact (if this is an entretien) */}
      {formData.parent_contact_id && parentContact && (
        <div className="bg-card/40 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-border/50 animate-slide-up" style={{ animationDelay: '0.12s' }}>
          <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
            <Phone className="h-6 w-6 text-primary" />
            Contact Parent
          </h2>
          <div className="bg-background/50 rounded-xl p-6 border border-border/50">
            <div className="flex items-center justify-between">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Type</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium capitalize ${
                    parentContact.type === 'commercial' ? 'bg-primary/10 text-primary' :
                    parentContact.type === 'spontané' ? 'bg-accent/10 text-accent' :
                    'bg-purple-500/10 text-purple-500'
                  }`}>
                    {parentContact.type}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Motif</p>
                  <p className="text-foreground font-medium">{parentContact.motif}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Date</p>
                  <p className="text-foreground font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {formatDate(parentContact.date_contact)}
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate(`/client/${clientId}/contact/${parentContact.id}`, {
                  state: { contact: parentContact }
                })}
                className="gap-2 ml-4"
              >
                <Phone className="h-4 w-4" />
                Voir le contact
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Child Contacts (contacts linked to this one) */}
      {childContacts.length > 0 && (
        <div className="bg-card/40 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-border/50 animate-slide-up" style={{ animationDelay: '0.13s' }}>
          <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
            <Phone className="h-6 w-6 text-primary" />
            Contacts Liés ({childContacts.length})
          </h2>
          <div className="space-y-4">
            {childContacts.map((child) => (
              <div key={child.id} className="bg-background/50 rounded-xl p-6 border border-border/50">
                <div className="flex items-center justify-between">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 flex-1">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Type</p>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium capitalize ${
                        child.type === 'commercial' ? 'bg-primary/10 text-primary' :
                        child.type === 'spontané' ? 'bg-accent/10 text-accent' :
                        'bg-purple-500/10 text-purple-500'
                      }`}>
                        {child.type}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Motif</p>
                      <p className="text-foreground font-medium">{child.motif}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Date</p>
                      <p className="text-foreground font-medium flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {formatDate(child.date_contact)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">État</p>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium capitalize ${
                        child.etat === 'réalisé' ? 'bg-green-500/10 text-green-500' :
                        child.etat === 'planifié' ? 'bg-blue-500/10 text-blue-500' :
                        'bg-red-500/10 text-red-500'
                      }`}>
                        {child.etat}
                      </span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate(`/client/${clientId}/contact/${child.id}`, {
                      state: { contact: child }
                    })}
                    className="gap-2 ml-4"
                  >
                    <Phone className="h-4 w-4" />
                    Voir le contact
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Offers Section (for entretien being realized or already realized) */}
      {isEntretien && (mode === 'realiser' || (mode === 'view' && formData.etat === 'réalisé')) && (
        <div className="bg-card/40 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-border/50 animate-slide-up" style={{ animationDelay: '0.15s' }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <PackagePlus className="h-6 w-6 text-primary" />
              Offres Proposées
            </h2>
            {mode === 'realiser' && !showOfferSelection && (
              <div className="flex gap-2">
                <Button 
                  onClick={() => { setOfferType('contrat'); setShowOfferSelection(true); }} 
                  size="sm" 
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Ajouter Contrat
                </Button>
                <Button 
                  onClick={() => { setOfferType('produit'); setShowOfferSelection(true); }} 
                  size="sm" 
                  variant="outline"
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Ajouter Produit
                </Button>
              </div>
            )}
          </div>

          {/* Offer Selection Form */}
          {showOfferSelection && mode === 'realiser' && (
            <div className="bg-background/50 rounded-xl p-6 border border-border/50 mb-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Ajouter une offre {offerType === 'contrat' ? 'de Contrat' : 'de Produit'}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Sélectionner {offerType === 'contrat' ? 'un contrat' : 'un produit'}
                  </label>
                  <select
                    value={selectedOffer}
                    onChange={(e) => setSelectedOffer(e.target.value)}
                    className="w-full bg-background border border-input rounded-md px-3 py-2 text-foreground"
                  >
                    <option value="">-- Sélectionner --</option>
                    {(offerType === 'contrat' ? AVAILABLE_CONTRATS : AVAILABLE_PRODUITS).map(item => (
                      <option key={item} value={item}>{item}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Annotation
                  </label>
                  <textarea
                    value={offerAnnotation}
                    onChange={(e) => setOfferAnnotation(e.target.value)}
                    placeholder="Notes sur la proposition..."
                    rows={3}
                    className="w-full bg-background border border-input rounded-md px-3 py-2 text-foreground resize-none"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleAddOffer} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Ajouter
                  </Button>
                  <Button onClick={() => setShowOfferSelection(false)} variant="outline">
                    Annuler
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Offers List */}
          {formData.offers && formData.offers.length > 0 ? (
            <div className="space-y-4">
              {formData.offers.map((offer, index) => (
                <div 
                  key={offer.id}
                  className="bg-background/50 rounded-xl p-6 border border-border/50"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          offer.type === 'contrat' 
                            ? 'bg-primary/10 text-primary' 
                            : 'bg-accent/10 text-accent'
                        }`}>
                          {offer.type === 'contrat' ? 'Contrat' : 'Produit'}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          offer.statut === 'proposé' ? 'bg-blue-500/10 text-blue-500' :
                          offer.statut === 'accepté' ? 'bg-green-500/10 text-green-500' :
                          'bg-red-500/10 text-red-500'
                        }`}>
                          {offer.statut}
                        </span>
                      </div>
                      <p className="font-semibold text-foreground text-lg">{offer.nom}</p>
                      {offer.annotation && (
                        <p className="text-sm text-muted-foreground mt-2">{offer.annotation}</p>
                      )}
                    </div>
                    {mode === 'realiser' && (
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleRemoveOffer(index)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>Aucune offre proposée</p>
            </div>
          )}
        </div>
      )}

      {/* Commentaire de clôture (for realized entretiens) */}
      {mode === 'view' && isEntretien && formData.etat === 'réalisé' && formData.commentaire_cloture && (
        <div className="bg-card/40 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-border/50 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <h2 className="text-2xl font-bold text-foreground mb-4">Commentaire de Clôture</h2>
          <p className="text-foreground">{formData.commentaire_cloture}</p>
        </div>
      )}

      {/* Plan Entretien Dialog */}
      {showPlanEntretien && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowPlanEntretien(false)}>
          <div className="bg-card rounded-2xl p-8 shadow-2xl border border-border max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-bold text-foreground mb-6">Planifier un Entretien</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Motif de l'entretien *
                </label>
                <Input
                  value={entretienMotif}
                  onChange={(e) => setEntretienMotif(e.target.value)}
                  placeholder="Motif de l'entretien"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Date de l'entretien *
                </label>
                <Input
                  type="date"
                  value={entretienDate}
                  onChange={(e) => setEntretienDate(e.target.value)}
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={handlePlanifierEntretien} className="flex-1 gap-2">
                  <CalendarPlus className="h-4 w-4" />
                  Planifier
                </Button>
                <Button onClick={() => setShowPlanEntretien(false)} variant="outline" className="flex-1">
                  Annuler
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Conclure Entretien Dialog */}
      {showConclureDialog && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowConclureDialog(false)}>
          <div className="bg-card rounded-2xl p-8 shadow-2xl border border-border max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-bold text-foreground mb-6">Conclure l'Entretien</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Commentaire de clôture *
                </label>
                <textarea
                  value={commentaireCloture}
                  onChange={(e) => setCommentaireCloture(e.target.value)}
                  placeholder="Saisissez vos remarques sur l'entretien..."
                  rows={5}
                  className="w-full bg-background border border-input rounded-md px-3 py-2 text-foreground resize-none"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={handleConfirmCloture} className="flex-1 gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Conclure
                </Button>
                <Button onClick={() => setShowConclureDialog(false)} variant="outline" className="flex-1">
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
