import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { mockClients, mockPersonnes, type Personne } from '@/mocks/data';
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
  Users,
  Edit,
  Plus,
  Mail,
  Phone,
  User
} from 'lucide-react';

export default function ClientPeoplePage() {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  const client = mockClients.find(c => c.id === clientId);
  const [personnes, setPersonnes] = useState<Personne[]>(
    mockPersonnes.filter(p => p.client_id === clientId)
  );

  // Update personnes list when navigating back from detail page with updated data
  useEffect(() => {
    if (location.state?.updatedPersonne) {
      const updated = location.state.updatedPersonne as Personne;
      setPersonnes(prev => prev.map(p => p.id === updated.id ? updated : p));
      navigate(location.pathname, { replace: true, state: {} });
    }
    if (location.state?.newPersonne) {
      const newP = location.state.newPersonne as Personne;
      setPersonnes(prev => {
        if (prev.some(p => p.id === newP.id)) return prev;
        return [...prev, newP];
      });
      navigate(location.pathname, { replace: true, state: {} });
    }
    if (location.state?.deletedPersonneId) {
      const deletedId = location.state.deletedPersonneId as string;
      setPersonnes(prev => prev.filter(p => p.id !== deletedId));
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
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleAdd = () => {
    navigate(`/client/${clientId}`, {
      state: { mode: 'add', clientId }
    });
  };

  const handleEdit = (personne: Personne) => {
    navigate(`/client/${clientId}`, {
      state: { mode: 'edit', personne, clientId }
    });
  };

  const handleView = (personne: Personne) => {
    navigate(`/client/${clientId}`, {
      state: { mode: 'view', personne, clientId }
    });
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
        <Button className="gap-2" onClick={handleAdd}>
          <Plus className="h-4 w-4" />
          Ajouter une personne
        </Button>
      </div>

      {/* Header */}
      <div className="bg-card/40 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-border/50 animate-slide-up">
        <div className="flex items-center gap-4 mb-2">
          <Users className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-4xl font-bold text-foreground">Gestion des Membres</h1>
            <p className="text-muted-foreground mt-2">Client: {client.denomination}</p>
            <p className="text-sm text-muted-foreground/70 font-mono">{client.numero_client}</p>
          </div>
        </div>
      </div>

      {/* People List */}
      <div className="bg-card/40 backdrop-blur-sm rounded-2xl shadow-2xl border border-border/50 overflow-hidden animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <div className="p-6 border-b border-border/50">
          <h2 className="text-xl font-semibold text-foreground">
            Liste des Membres ({personnes.length})
          </h2>
        </div>

        {personnes.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">Aucun membre enregistré</p>
            <Button onClick={handleAdd}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter le premier membre
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead className="text-xs uppercase tracking-wider py-5">Nom Complet</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider py-5">Rôle</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider py-5">Contact</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider py-5">Profession</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider py-5">Cotation</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider py-5">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {personnes.map((personne, index) => (
                  <TableRow 
                    key={personne.id}
                    className="cursor-pointer transition-all hover:bg-accent/20"
                    onClick={() => handleView(personne)}
                    style={{ 
                      animationDelay: `${0.05 * index}s`,
                      animation: 'slide-up 0.3s ease-out'
                    }}
                  >
                    <TableCell className="py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{personne.prenom} {personne.nom}</p>
                          <p className="text-xs text-muted-foreground">
                            Né(e) le {formatDate(personne.date_naissance)}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-5">
                      <span className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-medium text-primary">
                        {personne.role}
                      </span>
                    </TableCell>
                    <TableCell className="py-5">
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          <span className="truncate max-w-[200px]">{personne.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          <span>{personne.telephone}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-5 text-sm text-muted-foreground">
                      {personne.profession || 'N/A'}
                    </TableCell>
                    <TableCell className="py-5">
                      {personne.cotation ? (
                        <span className="px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-sm font-mono text-accent">
                          {personne.cotation}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="py-5">
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(personne);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
