import { useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { mockContratsTemplates, type ContratTemplate } from '@/mocks/data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ArrowLeft,
  Search,
  FileText,
  CheckCircle2,
  Euro,
  Calendar,
  Filter,
  X,
} from 'lucide-react';

export default function ContractCatalogPage() {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<string>('');
  const [selectedTemplate, setSelectedTemplate] = useState<ContratTemplate | null>(null);

  const domains = Array.from(new Set(mockContratsTemplates.map(t => t.domaine)));

  const filteredTemplates = mockContratsTemplates.filter(template => {
    const matchesSearch = template.intitule.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.descriptif.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDomain = !selectedDomain || template.domaine === selectedDomain;
    return matchesSearch && matchesDomain;
  });

  const handleSubscribe = (template: ContratTemplate) => {
    // If we were opened to return a selected contract to a contact, do that instead
    const returnToContact = (location.state as any)?.returnToContact as string | undefined;
    if (returnToContact) {
      navigate(`/client/${clientId}/contact/${returnToContact}`, {
        state: { selectedOffer: template.intitule, offerType: 'contrat' }
      });
      return;
    }

    navigate(`/client/${clientId}/subscription/new`, {
      state: { template }
    });
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
          Retour
        </Button>
      </div>

      {/* Title */}
      <div className="bg-card/40 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-border/50 animate-slide-up">
        <div className="flex items-center gap-4">
          <FileText className="h-10 w-10 text-primary" />
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-foreground">
              Catalogue de Contrats
            </h1>
            <p className="text-muted-foreground mt-2">
              Sélectionnez un contrat pour souscrire
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card/40 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-border/50 animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher un contrat..."
              className="pl-10"
            />
          </div>

          {/* Domain Filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
              className="bg-background border border-input rounded-md px-3 py-2 text-foreground"
            >
              <option value="">Tous les domaines</option>
              {domains.map(domain => (
                <option key={domain} value={domain}>{domain}</option>
              ))}
            </select>
            {selectedDomain && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSelectedDomain('')}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Contract Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template, index) => (
          <div
            key={template.id}
            className="bg-card/40 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-border/50 hover:border-primary/50 transition-all cursor-pointer animate-slide-up"
            style={{ animationDelay: `${0.15 + index * 0.05}s` }}
            onClick={() => setSelectedTemplate(template)}
          >
            <div className="flex items-start justify-between mb-4">
              <span className={`px-3 py-1 rounded-full border text-xs font-medium ${getDomainColor(template.domaine)}`}>
                {template.domaine}
              </span>
              <FileText className="h-5 w-5 text-primary" />
            </div>

            <h3 className="text-lg font-bold text-foreground mb-2">
              {template.intitule}
            </h3>
            
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
              {template.descriptif}
            </p>

            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Mensuel</span>
                <span className="font-semibold text-foreground">
                  {formatCurrency(template.tarif_base_mensuel)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Annuel</span>
                <span className="font-semibold text-primary">
                  {formatCurrency(template.tarif_base_annuel)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
              <CheckCircle2 className="h-4 w-4" />
              <span>{template.options.length} option(s) disponible(s)</span>
            </div>

            <Button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedTemplate(template);
              }}
              className="w-full"
            >
              Voir les détails
            </Button>
          </div>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-20 text-muted-foreground">
          <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg">Aucun contrat trouvé</p>
          <p className="text-sm mt-2">Essayez de modifier vos critères de recherche</p>
        </div>
      )}

      {/* Detail Modal */}
      {selectedTemplate && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedTemplate(null)}
        >
          <div 
            className="bg-card rounded-2xl shadow-2xl border border-border max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-card/95 backdrop-blur-sm border-b border-border p-6 z-10">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <span className={`px-3 py-1 rounded-full border text-xs font-medium ${getDomainColor(selectedTemplate.domaine)}`}>
                    {selectedTemplate.domaine}
                  </span>
                  <h2 className="text-2xl font-bold text-foreground mt-3">
                    {selectedTemplate.intitule}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedTemplate.code_contrat}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedTemplate(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Description</h3>
                <p className="text-muted-foreground">{selectedTemplate.descriptif}</p>
              </div>

              {/* Tarifs */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">Tarifs de base</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-background/50 rounded-xl p-4 border border-border/50">
                    <p className="text-sm text-muted-foreground mb-1">Mensuel</p>
                    <p className="text-2xl font-bold text-foreground flex items-center gap-2">
                      <Euro className="h-5 w-5 text-primary" />
                      {formatCurrency(selectedTemplate.tarif_base_mensuel)}
                    </p>
                  </div>
                  <div className="bg-background/50 rounded-xl p-4 border border-primary/50">
                    <p className="text-sm text-muted-foreground mb-1">Annuel</p>
                    <p className="text-2xl font-bold text-primary flex items-center gap-2">
                      <Euro className="h-5 w-5" />
                      {formatCurrency(selectedTemplate.tarif_base_annuel)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Durée standard */}
              {selectedTemplate.duree_standard && (
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Durée standard</h3>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{selectedTemplate.duree_standard} mois</span>
                  </div>
                </div>
              )}

              {/* Options */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">
                  Options disponibles ({selectedTemplate.options.length})
                </h3>
                <div className="space-y-3">
                  {selectedTemplate.options.map(option => (
                    <div
                      key={option.id}
                      className="bg-background/50 rounded-xl p-4 border border-border/50"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-semibold text-foreground">{option.nom}</h4>
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
                              {formatCurrency(option.prix_mensuel)}/mois
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatCurrency(option.prix_annuel)}/an
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Subscribe Button */}
              <div className="sticky bottom-0 bg-card/95 backdrop-blur-sm border-t border-border pt-6 -mx-6 -mb-6 px-6 pb-6">
                {((location.state as any)?.returnToContact) ? (
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleSubscribe(selectedTemplate)}
                      className="w-full gap-2"
                      size="lg"
                    >
                      <CheckCircle2 className="h-5 w-5" />
                      Sélectionner ce contrat
                    </Button>
                    <Button
                      variant="ghost"
                      size="lg"
                      onClick={() => setSelectedTemplate(null)}
                    >
                      Annuler
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={() => handleSubscribe(selectedTemplate)}
                    className="w-full gap-2"
                    size="lg"
                  >
                    <CheckCircle2 className="h-5 w-5" />
                    Souscrire à ce contrat
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
