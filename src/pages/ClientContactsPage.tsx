import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { mockClients, mockContacts, type Contact } from '@/mocks/data';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  ArrowLeft,
  Phone,
  Plus,
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
  User,
  Link as LinkIcon
} from 'lucide-react';

export default function ClientContactsPage() {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  const client = mockClients.find(c => c.id === clientId);
  const sortContacts = (arr: Contact[]) => {
    return arr.slice().sort((a, b) => {
      const ta = a.date_contact ? new Date(a.date_contact).getTime() : 0;
      const tb = b.date_contact ? new Date(b.date_contact).getTime() : 0;
      return tb - ta; // newest first
    });
  };

  const [contacts, setContacts] = useState<Contact[]>(
    sortContacts(mockContacts.filter(c => c.client_id === clientId))
  );

  // Update contacts list when navigating back from detail page
  useEffect(() => {
    if (location.state?.updatedContact) {
      const updated = location.state.updatedContact as Contact;
      setContacts(prev => sortContacts(prev.map(c => c.id === updated.id ? updated : c)));
      // Clear the state to prevent re-adding on re-render
      navigate(location.pathname, { replace: true, state: {} });
    }
    if (location.state?.newContact) {
      const newC = location.state.newContact as Contact;
      // Only add if it doesn't already exist
      setContacts(prev => {
        if (prev.some(c => c.id === newC.id)) {
          return prev;
        }
        return sortContacts([...prev, newC]);
      });
      // Clear the state to prevent re-adding on re-render
      navigate(location.pathname, { replace: true, state: {} });
    }
    if (location.state?.deletedContactId) {
      const deletedId = location.state.deletedContactId as string;
      setContacts(prev => sortContacts(prev.filter(c => c.id !== deletedId)));
      // Clear the state to prevent re-adding on re-render
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);

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

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString('fr-FR', { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' });
    } catch {
      return dateString;
    }
  };

  const handleCreateCommercial = () => {
    navigate(`/client/${clientId}/contact/new`, {
      state: { mode: 'add', type: 'commercial', clientId }
    });
  };

  const handleCreateSpontane = () => {
    navigate(`/client/${clientId}/contact/new`, {
      state: { mode: 'add', type: 'spontané', clientId }
    });
  };

  const handleView = (contact: Contact) => {
    navigate(`/client/${clientId}/contact/${contact.id}`, {
      state: { mode: 'view', contact, clientId }
    });
  };

  const getEtatIcon = (etat: string) => {
    switch (etat) {
      case 'réalisé': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'planifié': return <Clock className="h-4 w-4 text-blue-500" />;
      case 'annulé': return <XCircle className="h-4 w-4 text-red-500" />;
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

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'commercial': return 'bg-primary/10 text-primary border-primary/20';
      case 'spontané': return 'bg-accent/10 text-accent border-accent/20';
      case 'entretien': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  // Find parent contact for entretiens
  const getParentContact = (contact: Contact) => {
    if (!contact.parent_contact_id) return null;
    return contacts.find(c => c.id === contact.parent_contact_id);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      {/* Back Button */}
      <div className="flex items-center justify-between">
        <Button 
          variant="ghost" 
          onClick={() => navigate(`/client/${clientId}`)}
          className="hover:bg-accent/50"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour au dossier client
        </Button>
        <div className="flex gap-2">
          <Button className="gap-2" onClick={handleCreateCommercial}>
            <Plus className="h-4 w-4" />
            Contact Commercial
          </Button>
          <Button className="gap-2" variant="outline" onClick={handleCreateSpontane}>
            <Plus className="h-4 w-4" />
            Contact Spontané
          </Button>
        </div>
      </div>

      {/* Header */}
      <div className="bg-card/40 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-border/50 animate-slide-up">
        <div className="flex items-center gap-4 mb-2">
          <Phone className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-4xl font-bold text-foreground">Historique des Contacts</h1>
            <p className="text-muted-foreground mt-2">Client: {client.denomination}</p>
            <p className="text-sm text-muted-foreground/70 font-mono">{client.numero_client}</p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <div className="bg-card/40 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-border/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Total Contacts</span>
            <Phone className="h-5 w-5 text-primary" />
          </div>
          <p className="text-3xl font-bold text-foreground">{contacts.length}</p>
        </div>

        <div className="bg-card/40 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-border/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Entretiens</span>
            <Clock className="h-5 w-5 text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-blue-500">
            {contacts.filter(c => c.type === 'entretien').length}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {contacts.filter(c => c.type === 'entretien' && c.etat === 'planifié').length} planifié{contacts.filter(c => c.type === 'entretien' && c.etat === 'planifié').length > 1 ? 's' : ''}
          </p>
        </div>

        <div className="bg-card/40 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-border/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Contacts Commerciaux</span>
            <User className="h-5 w-5 text-primary" />
          </div>
          <p className="text-3xl font-bold text-primary">
            {contacts.filter(c => c.type === 'commercial').length}
          </p>
        </div>

        <div className="bg-card/40 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-border/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Contacts Spontanés</span>
            <Phone className="h-5 w-5 text-accent" />
          </div>
          <p className="text-3xl font-bold text-accent">
            {contacts.filter(c => c.type === 'spontané').length}
          </p>
        </div>
      </div>

      {/* Contacts Table */}
      <div className="bg-card/40 backdrop-blur-sm rounded-2xl shadow-2xl border border-border/50 overflow-hidden animate-slide-up" style={{ animationDelay: '0.15s' }}>
        <div className="p-6 border-b border-border/50">
          <h2 className="text-xl font-semibold text-foreground">Liste des Contacts</h2>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead className="text-xs uppercase tracking-wider py-5">Type</TableHead>
                <TableHead className="text-xs uppercase tracking-wider py-5">Motif</TableHead>
                <TableHead className="text-xs uppercase tracking-wider py-5">Date</TableHead>
                <TableHead className="text-xs uppercase tracking-wider py-5">Agent</TableHead>
                <TableHead className="text-xs uppercase tracking-wider py-5">État</TableHead>
                <TableHead className="text-xs uppercase tracking-wider py-5">Lié à</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contacts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                    Aucun contact enregistré
                  </TableCell>
                </TableRow>
              ) : (
                contacts.map((contact, index) => {
                  const parentContact = getParentContact(contact);
                  return (
                    <TableRow 
                      key={contact.id}
                      className="cursor-pointer transition-all hover:bg-accent/20"
                      onClick={() => handleView(contact)}
                      style={{ 
                        animationDelay: `${0.05 * index}s`,
                        animation: 'slide-up 0.3s ease-out'
                      }}
                    >
                      <TableCell className="py-5">
                        <span className={`px-3 py-1 rounded-full border text-xs font-medium capitalize ${getTypeColor(contact.type)}`}>
                          {contact.type}
                        </span>
                      </TableCell>
                      <TableCell className="py-5">
                        <p className="font-medium text-foreground">{contact.motif}</p>
                      </TableCell>
                      <TableCell className="py-5">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-foreground">{formatDate(contact.date_contact)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-5">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-foreground">{contact.agent}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-5">
                        <span className={`px-3 py-1 rounded-full border text-xs font-medium flex items-center gap-2 w-fit capitalize ${getEtatColor(contact.etat)}`}>
                          {getEtatIcon(contact.etat)}
                          {contact.etat}
                        </span>
                      </TableCell>
                      <TableCell className="py-5">
                        {parentContact ? (
                          <div className="flex items-center gap-2">
                            <LinkIcon className="h-4 w-4 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {parentContact.type} - {parentContact.motif}
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-xs">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
