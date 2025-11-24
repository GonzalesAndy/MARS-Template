import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { mockContratsTemplates, type ContratTemplate, AVAILABLE_PRODUITS_CATALOG, type ProduitCatalogItem, AVAILABLE_OFFRES_CATALOG, type OffreCatalogItem } from '@/mocks/data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Search, FileText } from 'lucide-react';

export default function OfferCatalogPage() {
  const { clientId, contactId, type } = useParams<{ clientId: string; contactId: string; type: 'contrat' | 'produit' }>();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('');
  const [selectedSegment, setSelectedSegment] = useState('');

  // Contracts view
  const domains = Array.from(new Set(mockContratsTemplates.map(t => t.domaine)));

  const filteredTemplates = mockContratsTemplates.filter(template => {
    const matchesSearch = template.intitule.toLowerCase().includes(searchTerm.toLowerCase()) || template.descriptif.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDomain = !selectedDomain || template.domaine === selectedDomain;
    return matchesSearch && matchesDomain;
  });

  // Products view
  const segments = Array.from(new Set(AVAILABLE_PRODUITS_CATALOG.flatMap(p => p.segments)));
  const filteredProducts = AVAILABLE_PRODUITS_CATALOG.filter(p => {
    const matchesSearch = p.nom.toLowerCase().includes(searchTerm.toLowerCase()) || (p.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSegment = !selectedSegment || p.segments.includes(selectedSegment);
    return matchesSearch && matchesSegment;
  });

  const [selectedContract, setSelectedContract] = useState<ContratTemplate | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<ProduitCatalogItem | null>(null);
  const [selectedOfferItem, setSelectedOfferItem] = useState<OffreCatalogItem | null>(null);

  const handleSelectContract = (tpl: ContratTemplate) => {
    setSelectedContract(tpl);
  };

  const handleSelectProduct = (prod: ProduitCatalogItem) => {
    setSelectedProduct(prod);
  };

  const handleSelectOfferItem = (offre: OffreCatalogItem) => {
    setSelectedOfferItem(offre);
  };

  const confirmSelect = (name: string, typeStr: 'contrat' | 'produit' | 'offre', annotation?: string, products?: string[]) => {
    navigate(`/client/${clientId}/contact/${contactId}`, {
      state: { selectedOffer: name, offerType: typeStr, offerAnnotation: annotation, offerProducts: products }
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate(`/client/${clientId}/contact/${contactId}`)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
      </div>

      <div className="bg-card/40 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-border/50 animate-slide-up">
        <div className="flex items-center gap-4">
          <FileText className="h-10 w-10 text-primary" />
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-foreground">{type === 'produit' ? 'Catalogue de Produits' : 'Catalogue de Contrats'}</h1>
            <p className="text-muted-foreground mt-2">Sélectionnez une {type === 'produit' ? 'produit' : 'contrat'} à proposer</p>
          </div>
        </div>
      </div>

      <div className="bg-card/40 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-border/50 animate-slide-up">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder={type === 'produit' ? 'Rechercher un produit...' : 'Rechercher un contrat...'} className="pl-10" />
          </div>

          {type === 'produit' ? (
            <div className="flex items-center gap-2">
              <select value={selectedSegment} onChange={(e) => setSelectedSegment(e.target.value)} className="bg-background border border-input rounded-md px-3 py-2 text-foreground">
                <option value="">Tous les segments</option>
                {segments.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              {selectedSegment && <Button size="sm" variant="ghost" onClick={() => setSelectedSegment('')}>Clear</Button>}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <select value={selectedDomain} onChange={(e) => setSelectedDomain(e.target.value)} className="bg-background border border-input rounded-md px-3 py-2 text-foreground">
                <option value="">Tous les domaines</option>
                {domains.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              {selectedDomain && <Button size="sm" variant="ghost" onClick={() => setSelectedDomain('')}>Clear</Button>}
            </div>
          )}
        </div>
      </div>

      {type === 'produit' ? (
        // Now show an Offers-style list built from AVAILABLE_OFFRES_CATALOG but still allow viewing product details
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {AVAILABLE_OFFRES_CATALOG.filter(o => {
            const matchesSearch = o.nom.toLowerCase().includes(searchTerm.toLowerCase()) || (o.description || '').toLowerCase().includes(searchTerm.toLowerCase());
            const matchesSegment = !selectedSegment || o.segments.includes(selectedSegment);
            return matchesSearch && matchesSegment;
          }).map((offre) => (
            <div key={offre.nom} className="bg-card/40 rounded-2xl p-6 shadow-2xl border border-border/50 hover:border-primary/50 cursor-pointer">
              <div className="flex items-start justify-between mb-4">
                <span className={`px-3 py-1 rounded-full border text-xs font-medium`}>{offre.segments[0] || 'Offre'}</span>
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">{offre.nom}</h3>
              {offre.description && <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{offre.description}</p>}
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">Produits: {offre.products.length}</p>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleSelectOfferItem(offre)}>Voir détail</Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((tpl) => (
            <div key={tpl.id} onClick={() => handleSelectContract(tpl)} className="bg-card/40 rounded-2xl p-6 shadow-2xl border border-border/50 hover:border-primary/50 cursor-pointer">
              <div className="flex items-start justify-between mb-4">
                <span className={`px-3 py-1 rounded-full border text-xs font-medium`}>{tpl.domaine}</span>
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">{tpl.intitule}</h3>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{tpl.descriptif}</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Mensuel</span>
                  <span className="font-semibold text-foreground">{tpl.tarif_base_mensuel} €</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal for Contract */}
      {selectedContract && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelectedContract(null)}>
          <div className="bg-card rounded-2xl shadow-2xl border border-border max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-card/95 backdrop-blur-sm border-b border-border p-6 z-10">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <span className={`px-3 py-1 rounded-full border text-xs font-medium`}>{selectedContract.domaine}</span>
                  <h2 className="text-2xl font-bold text-foreground mt-3">{selectedContract.intitule}</h2>
                  <p className="text-sm text-muted-foreground mt-1">{selectedContract.code_contrat}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSelectedContract(null)}>
                  <span className="sr-only">Close</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                </Button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Description</h3>
                <p className="text-muted-foreground">{selectedContract.descriptif}</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">Tarifs de base</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-background/50 rounded-xl p-4 border border-border/50">
                    <p className="text-sm text-muted-foreground mb-1">Mensuel</p>
                    <p className="text-2xl font-bold text-foreground">{selectedContract.tarif_base_mensuel} €</p>
                  </div>
                  <div className="bg-background/50 rounded-xl p-4 border border-primary/50">
                    <p className="text-sm text-muted-foreground mb-1">Annuel</p>
                    <p className="text-2xl font-bold text-primary">{selectedContract.tarif_base_annuel} €</p>
                  </div>
                </div>
              </div>

              {selectedContract.duree_standard && (
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Durée standard</h3>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <span>{selectedContract.duree_standard} mois</span>
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">Options disponibles ({selectedContract.options.length})</h3>
                <div className="space-y-3">
                  {selectedContract.options.map(option => (
                    <div key={option.id} className="bg-background/50 rounded-xl p-4 border border-border/50">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-semibold text-foreground">{option.nom}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{option.description}</p>
                        </div>
                        {option.est_gratuite ? (
                          <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-xs font-medium ml-3">Gratuite</span>
                        ) : (
                          <div className="text-right ml-3">
                            <p className="text-sm font-semibold text-foreground">{option.prix_mensuel} €/mois</p>
                            <p className="text-xs text-muted-foreground">{option.prix_annuel} €/an</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="sticky bottom-0 bg-card/95 backdrop-blur-sm border-t border-border pt-6 -mx-6 -mb-6 px-6 pb-6">
                <div className="flex gap-2">
                  <Button onClick={() => confirmSelect(selectedContract.intitule, 'contrat')} className="w-full">Sélectionner ce contrat</Button>
                  <Button variant="ghost" onClick={() => setSelectedContract(null)}>Fermer</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal for Product */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelectedProduct(null)}>
          <div className="bg-card rounded-2xl shadow-2xl border border-border max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-card/95 backdrop-blur-sm border-b border-border p-6 z-10">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-foreground mt-1">{selectedProduct.nom}</h2>
                  <p className="text-sm text-muted-foreground mt-1">Segments: {selectedProduct.segments.join(', ')}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSelectedProduct(null)}>
                  <span className="sr-only">Close</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                </Button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Description</h3>
                <p className="text-muted-foreground">{selectedProduct.description}</p>
              </div>

              <div className="sticky bottom-0 bg-card/95 backdrop-blur-sm border-t border-border pt-6 -mx-6 -mb-6 px-6 pb-6">
                <div className="flex gap-2">
                  <Button onClick={() => confirmSelect(selectedProduct.nom, 'produit')} className="w-full">Sélectionner ce produit</Button>
                  <Button variant="ghost" onClick={() => setSelectedProduct(null)}>Fermer</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal for Offer */}
      {selectedOfferItem && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelectedOfferItem(null)}>
          <div className="bg-card rounded-2xl shadow-2xl border border-border max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-card/95 backdrop-blur-sm border-b border-border p-6 z-10">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-foreground mt-1">{selectedOfferItem.nom}</h2>
                  <p className="text-sm text-muted-foreground mt-1">Segments: {selectedOfferItem.segments.join(', ')}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSelectedOfferItem(null)}>
                  <span className="sr-only">Close</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                </Button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Description</h3>
                <p className="text-muted-foreground">{selectedOfferItem.description}</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">Produits inclus ({selectedOfferItem.products.length})</h3>
                <div className="space-y-3">
                  {selectedOfferItem.products.map(prodName => {
                    const prod = AVAILABLE_PRODUITS_CATALOG.find(p => p.nom === prodName);
                    return (
                      <div key={prodName} className="bg-background/50 rounded-xl p-4 border border-border/50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-foreground">{prod?.nom || prodName}</p>
                            {prod?.description && (
                              <p className="text-sm text-muted-foreground mt-1">{prod.description}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="sticky bottom-0 bg-card/95 backdrop-blur-sm border-t border-border pt-6 -mx-6 -mb-6 px-6 pb-6">
                <div className="flex gap-2">
                  <Button onClick={() => confirmSelect(selectedOfferItem.nom, 'offre', selectedOfferItem.description, selectedOfferItem.products)} className="w-full">Sélectionner cette offre</Button>
                  <Button variant="ghost" onClick={() => setSelectedOfferItem(null)}>Fermer</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
