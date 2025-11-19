import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { mockClients, mockPersonnes } from '@/mocks/data';
import { Search, Filter } from 'lucide-react';

export default function HomePage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [cityQuery, setCityQuery] = useState('');
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'denomination' | 'members' | 'number'>('all');

  // Filter clients based on search query and filter type
  const filteredClients = useMemo(() => {
    return mockClients.filter((client) => {
      const query = searchQuery.toLowerCase();
      const cityQueryLower = cityQuery.toLowerCase();
      const city = client.adresse_principale.split(',').pop()?.trim().toLowerCase() || '';
      
      // City filter (AND condition)
      if (cityQuery && !city.includes(cityQueryLower)) {
        return false;
      }
      
      // Main search filter
      if (!searchQuery) return true;
      
      switch (filterType) {
        case 'denomination':
          return client.denomination.toLowerCase().includes(query);
        
        case 'members': {
          const clientMembers = mockPersonnes.filter(p => p.client_id === client.id);
          return clientMembers.some(member => 
            `${member.prenom} ${member.nom}`.toLowerCase().includes(query)
          );
        }
        
        case 'number':
          return client.numero_client.toLowerCase().includes(query);
        
        default: {
          // Search all fields
          const clientMembers = mockPersonnes.filter(p => p.client_id === client.id);
          const memberNames = clientMembers.map(m => `${m.prenom} ${m.nom}`.toLowerCase()).join(' ');
          
          return (
            client.denomination.toLowerCase().includes(query) ||
            client.numero_client.toLowerCase().includes(query) ||
            memberNames.includes(query)
          );
        }
      }
    });
  }, [searchQuery, cityQuery, filterType]);

  const getClientMembers = (clientId: string) => {
    const members = mockPersonnes.filter(p => p.client_id === clientId);
    return members.length > 0 
      ? members.map(m => `${m.prenom} ${m.nom}`).join(', ')
      : 'N/A';
  };

  const handleConsultClient = () => {
    if (selectedClient) {
      navigate(`/client/${selectedClient}`);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-16">
      {/* Hero Section */}
      <div className="text-center space-y-6 py-12 animate-fade-in">
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight tracking-tight">
          N26²
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-primary">Tableau de bord</span>
        </h1>
      </div>

      {/* Search Section */}
      <div className="bg-card/40 backdrop-blur-sm rounded-2xl p-8 md:p-12 shadow-2xl border border-border/50 animate-slide-up">
        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-3 mb-8 justify-center">
          <Button
            variant={filterType === 'denomination' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterType('denomination')}
            className="transition-all hover:scale-105"
          >
            Dénomination
          </Button>
          <Button
            variant={filterType === 'members' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterType('members')}
            className="transition-all hover:scale-105"
          >
            Personnes
          </Button>
          <Button
            variant={filterType === 'number' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterType('number')}
            className="transition-all hover:scale-105"
          >
            N° Client
          </Button>
        </div>

        {/* Search Bar */}
        <div className="space-y-4 max-w-3xl mx-auto">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder={`Rechercher par ${
                  filterType === 'denomination' ? 'dénomination' :
                  filterType === 'members' ? 'membres' :
                  'numéro client'
                }...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-14 pr-6 h-14 text-base bg-background/50 border-border/50 rounded-xl focus:ring-primary transition-all"
              />
            </div>
            <Button 
              className="h-14 px-10 text-base rounded-xl transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/30"
            >
              <Search className="h-5 w-5 mr-2" />
              Rechercher
            </Button>
          </div>
          
          {/* City Filter */}
          <div className="relative">
            <Filter className="absolute left-5 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Filtrer par ville (optionnel)..."
              value={cityQuery}
              onChange={(e) => setCityQuery(e.target.value)}
              className="pl-14 pr-6 h-12 text-sm bg-background/30 border-border/30 rounded-xl focus:ring-primary transition-all"
            />
          </div>
        </div>

        {/* Results Count */}
        <p className="text-sm text-muted-foreground/70 mt-6 text-center">
          {filteredClients.length} client{filteredClients.length > 1 ? 's' : ''} trouvé{filteredClients.length > 1 ? 's' : ''}
        </p>
      </div>

      {/* Table Section */}
      <div className="bg-card/40 backdrop-blur-sm rounded-2xl shadow-2xl border border-border/50 overflow-hidden animate-slide-up" style={{ animationDelay: '0.15s' }}>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30 border-b border-border/50">
                <TableHead className="w-16 py-5"></TableHead>
                <TableHead className="font-semibold text-foreground text-sm uppercase tracking-wider py-5">Client</TableHead>
                <TableHead className="font-semibold text-foreground text-sm uppercase tracking-wider py-5">Adresse</TableHead>
                <TableHead className="font-semibold text-foreground text-sm uppercase tracking-wider py-5">Personnes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    Aucun client trouvé
                  </TableCell>
                </TableRow>
              ) : (
                filteredClients.map((client, index) => (
                  <TableRow
                    key={client.id}
                    onClick={() => setSelectedClient(client.id)}
                    className={`cursor-pointer transition-all hover:bg-accent/20 border-b border-border/30 ${
                      selectedClient === client.id 
                        ? 'bg-primary/10' 
                        : ''
                    }`}
                    style={{ 
                      animationDelay: `${0.05 * index}s`,
                      animation: 'slide-up 0.3s ease-out'
                    }}
                  >
                    <TableCell className="py-5">
                      <div className={`w-3 h-3 rounded-full transition-all ${
                        selectedClient === client.id 
                          ? 'bg-primary shadow-lg shadow-primary/50' 
                          : 'bg-muted/50'
                      }`} />
                    </TableCell>
                    <TableCell className="font-medium py-5">
                      <div className="flex flex-col gap-1">
                        <span className="text-foreground text-base">{client.denomination}</span>
                        <span className="text-xs text-muted-foreground/70 font-mono">{client.numero_client}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground/80 py-5 text-sm">
                      {client.adresse_principale}
                    </TableCell>
                    <TableCell className="text-muted-foreground/80 py-5 text-sm">
                      {getClientMembers(client.id)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Consult Button */}
        {selectedClient && (
          <div className="p-6 bg-muted/20 border-t border-border/50 flex justify-center md:justify-end animate-slide-up">
            <Button 
              onClick={handleConsultClient}
              className="h-12 px-10 text-base rounded-xl transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/40"
            >
              Consulter le dossier client
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
