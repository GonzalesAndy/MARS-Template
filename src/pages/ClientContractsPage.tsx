import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { mockClients, mockContrats, type Contrat } from '@/mocks/data';
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
  FileText,
  Plus,
  Edit,
  Calendar,
  DollarSign,
  CheckCircle2,
  Clock,
  XCircle,
  Ban
} from 'lucide-react';

export default function ClientContractsPage() {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  const client = mockClients.find(c => c.id === clientId);
  const [contrats, setContrats] = useState<Contrat[]>(
    mockContrats.filter(c => c.client_id === clientId)
  );

  // Update contrats list when navigating back from detail page
  useEffect(() => {
    if (location.state?.updatedContrat) {
      const updated = location.state.updatedContrat as Contrat;
      setContrats(prev => prev.map(c => c.id === updated.id ? updated : c));
      navigate(location.pathname, { replace: true, state: {} });
    }
    if (location.state?.newContrat) {
      const newC = location.state.newContrat as Contrat;
      setContrats(prev => {
        if (prev.some(c => c.id === newC.id)) return prev;
        return [...prev, newC];
      });
      navigate(location.pathname, { replace: true, state: {} });
    }
    if (location.state?.deletedContratId) {
      const deletedId = location.state.deletedContratId as string;
      setContrats(prev => prev.filter(c => c.id !== deletedId));
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
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
  };

  const handleAdd = () => {
    navigate(`/client/${clientId}/contract/new`, {
      state: { mode: 'add', clientId }
    });
  };

  const handleEdit = (contrat: Contrat) => {
    navigate(`/client/${clientId}/contract/${contrat.id}`, {
      state: { mode: 'edit', contrat, clientId }
    });
  };

  const handleView = (contrat: Contrat) => {
    navigate(`/client/${clientId}/contract/${contrat.id}`, {
      state: { mode: 'view', contrat, clientId }
    });
  };

  const getEtatIcon = (etat: string) => {
    switch (etat) {
      case 'actif': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'planifié': return <Clock className="h-4 w-4 text-blue-500" />;
      case 'résilié': return <XCircle className="h-4 w-4 text-orange-500" />;
      case 'annulé': return <Ban className="h-4 w-4 text-red-500" />;
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

  const getDomaineColor = (domaine: string) => {
    const colors: Record<string, string> = {
      'Assurance': 'bg-primary/10 text-primary border-primary/20',
      'Téléphonie': 'bg-accent/10 text-accent border-accent/20',
      'Énergie': 'bg-green-500/10 text-green-500 border-green-500/20',
      'Internet': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    };
    return colors[domaine] || 'bg-gray-500/10 text-gray-500 border-gray-500/20';
  };

  // Group contracts by domain
  const contratsByDomain = contrats.reduce((acc, contrat) => {
    if (!acc[contrat.domaine]) {
      acc[contrat.domaine] = [];
    }
    acc[contrat.domaine].push(contrat);
    return acc;
  }, {} as Record<string, Contrat[]>);

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
          Nouveau contrat
        </Button>
      </div>

      {/* Header */}
      <div className="bg-card/40 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-border/50 animate-slide-up">
        <div className="flex items-center gap-4 mb-2">
          <FileText className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-4xl font-bold text-foreground">Gestion des Contrats</h1>
            <p className="text-muted-foreground mt-2">Client: {client.denomination}</p>
            <p className="text-sm text-muted-foreground/70 font-mono">{client.numero_client}</p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <div className="bg-card/40 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-border/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Total Contrats</span>
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <p className="text-3xl font-bold text-foreground">{contrats.length}</p>
        </div>

        <div className="bg-card/40 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-border/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Contrats Actifs</span>
            <CheckCircle2 className="h-5 w-5 text-green-500" />
          </div>
          <p className="text-3xl font-bold text-green-500">
            {contrats.filter(c => c.etat === 'actif').length}
          </p>
        </div>

        <div className="bg-card/40 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-border/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Revenu Mensuel</span>
            <DollarSign className="h-5 w-5 text-primary" />
          </div>
          <p className="text-2xl font-bold text-foreground">
            {formatCurrency(contrats.filter(c => c.etat === 'actif').reduce((sum, c) => sum + c.montant_mensuel, 0))}
          </p>
        </div>

        <div className="bg-card/40 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-border/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Revenu Annuel</span>
            <DollarSign className="h-5 w-5 text-accent" />
          </div>
          <p className="text-2xl font-bold text-foreground">
            {formatCurrency(contrats.filter(c => c.etat === 'actif').reduce((sum, c) => sum + c.montant_annuel, 0))}
          </p>
        </div>
      </div>

      {/* Contracts by Domain */}
      {Object.entries(contratsByDomain).map(([domaine, domainContrats], domainIndex) => (
        <div 
          key={domaine}
          className="bg-card/40 backdrop-blur-sm rounded-2xl shadow-2xl border border-border/50 overflow-hidden animate-slide-up" 
          style={{ animationDelay: `${0.15 + domainIndex * 0.05}s` }}
        >
          <div className="p-6 border-b border-border/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className={`px-4 py-2 rounded-full border text-sm font-medium ${getDomaineColor(domaine)}`}>
                {domaine}
              </span>
              <span className="text-muted-foreground">
                {domainContrats.length} contrat{domainContrats.length > 1 ? 's' : ''}
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead className="text-xs uppercase tracking-wider py-5">Code</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider py-5">Intitulé</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider py-5">Date Souscription</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider py-5">Durée</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider py-5">Périodicité</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider py-5">Montant</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider py-5">Options</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider py-5">État</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider py-5">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {domainContrats.map((contrat, index) => (
                  <TableRow 
                    key={contrat.id}
                    className="cursor-pointer transition-all hover:bg-accent/20"
                    onClick={() => handleView(contrat)}
                    style={{ 
                      animationDelay: `${0.05 * index}s`,
                      animation: 'slide-up 0.3s ease-out'
                    }}
                  >
                    <TableCell className="py-5">
                      <p className="font-mono text-xs font-medium text-foreground">{contrat.code_contrat}</p>
                    </TableCell>
                    <TableCell className="py-5">
                      <div>
                        <p className="font-medium text-foreground">{contrat.intitule}</p>
                        <p className="text-xs text-muted-foreground mt-1 max-w-xs truncate">{contrat.descriptif}</p>
                      </div>
                    </TableCell>
                    <TableCell className="py-5">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-foreground">{formatDate(contrat.date_souscription)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-5">
                      <span className="text-sm text-muted-foreground">
                        {contrat.duree ? `${contrat.duree} mois` : '-'}
                      </span>
                    </TableCell>
                    <TableCell className="py-5">
                      <span className="text-sm text-foreground capitalize">{contrat.periodicite}</span>
                    </TableCell>
                    <TableCell className="py-5">
                      <div>
                        <p className="font-semibold text-foreground">
                          {contrat.periodicite === 'mensuelle' 
                            ? formatCurrency(contrat.montant_mensuel)
                            : formatCurrency(contrat.montant_annuel)
                          }
                          <span className="text-xs text-muted-foreground">
                            /{contrat.periodicite === 'mensuelle' ? 'mois' : 'an'}
                          </span>
                        </p>
                        {contrat.periodicite === 'mensuelle' && (
                          <p className="text-xs text-muted-foreground">
                            {formatCurrency(contrat.montant_annuel)}/an
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-5">
                      {contrat.options && contrat.options.length > 0 ? (
                        <div className="space-y-1">
                          <span className="px-2 py-1 rounded bg-primary/10 text-xs font-medium text-primary">
                            {contrat.options.filter(o => o.statut === 'souscrite').length}/{contrat.options.length}
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-xs">-</span>
                      )}
                    </TableCell>
                    <TableCell className="py-5">
                      <span className={`px-3 py-1 rounded-full border text-xs font-medium flex items-center gap-2 w-fit ${getEtatColor(contrat.etat)}`}>
                        {getEtatIcon(contrat.etat)}
                        {contrat.etat}
                      </span>
                    </TableCell>
                    <TableCell className="py-5">
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(contrat);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      ))}

      {/* Empty State */}
      {contrats.length === 0 && (
        <div className="bg-card/40 backdrop-blur-sm rounded-2xl shadow-2xl border border-border/50 p-12 text-center">
          <FileText className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">Aucun contrat enregistré</p>
          <Button onClick={handleAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Créer le premier contrat
          </Button>
        </div>
      )}
    </div>
  );
}
