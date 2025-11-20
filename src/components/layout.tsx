import { Outlet, Link, useLocation, useParams } from 'react-router-dom';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';
import { Building2 } from 'lucide-react';
import { mockClients, mockContacts, mockSouscriptions, mockContratsTemplates } from '@/mocks/data';

interface BreadcrumbItemType {
  label: string;
  path?: string;
}

export default function Layout() {
  const location = useLocation();
  const params = useParams<{ clientId?: string; contactId?: string; contractId?: string; subscriptionId?: string }>();
  
  // Generate dynamic breadcrumbs based on current route
  const generateBreadcrumbs = (): BreadcrumbItemType[] => {
    const breadcrumbs: BreadcrumbItemType[] = [
      { label: 'N26²', path: '/dashboard' },
    ];

    const pathSegments = location.pathname.split('/').filter(Boolean);
    
    // Dashboard/Home
    if (pathSegments[0] === 'dashboard') {
      breadcrumbs.push({ label: 'Accueil' });
      return breadcrumbs;
    }

    // Client routes
    if (pathSegments[0] === 'client' && params.clientId) {
      const client = mockClients.find(c => c.id === params.clientId);
      const clientLabel = client?.denomination || `Client ${params.clientId}`;
      
      breadcrumbs.push({ 
        label: clientLabel, 
        path: `/client/${params.clientId}` 
      });

      // People management
      if (pathSegments[2] === 'people') {
        breadcrumbs.push({ label: 'Gestion des Personnes' });
      }
      // Contacts management
      else if (pathSegments[2] === 'contacts') {
        breadcrumbs.push({ 
          label: 'Historique des Contacts',
          path: `/client/${params.clientId}/contacts`
        });
      }
      // Contact detail
      else if (pathSegments[2] === 'contact' && params.contactId) {
        breadcrumbs.push({ 
          label: 'Historique des Contacts',
          path: `/client/${params.clientId}/contacts`
        });
        
        if (params.contactId === 'new') {
          breadcrumbs.push({ label: 'Nouveau Contact' });
        } else {
          // Try to find contact in location.state first (for navigation with state)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const locationState = (window.history.state?.usr as any);
          let contact = locationState?.contact;
          
          // Fallback to mockContacts if not in state
          if (!contact) {
            contact = mockContacts.find(c => c.id === params.contactId);
          }
          
          const contactLabel = contact ? `${contact.type} - ${contact.motif}` : `Contact ${params.contactId}`;
          breadcrumbs.push({ label: contactLabel });
        }
      }
      // Contracts management
      else if (pathSegments[2] === 'contracts') {
        breadcrumbs.push({ 
          label: 'Gestion des Contrats',
          path: `/client/${params.clientId}/contracts`
        });
        
        // Catalog page
        if (pathSegments[3] === 'catalog') {
          breadcrumbs.push({ label: 'Catalogue des Contrats' });
        }
      }
      // Subscription routes
      else if (pathSegments[2] === 'subscription') {
        breadcrumbs.push({ 
          label: 'Gestion des Contrats',
          path: `/client/${params.clientId}/contracts`
        });
        
        if (pathSegments[3] === 'new') {
          breadcrumbs.push({ label: 'Nouvelle Souscription' });
        } else if (params.subscriptionId || params.contractId) {
          const souscriptionId = params.subscriptionId || params.contractId;
          const souscription = mockSouscriptions.find(s => s.id === souscriptionId);
          if (souscription) {
            const template = mockContratsTemplates.find(t => t.id === souscription.contrat_template_id);
            const label = template ? `${souscription.code_souscription} - ${template.intitule}` : souscription.code_souscription;
            breadcrumbs.push({ label });
          } else {
            breadcrumbs.push({ label: `Souscription ${souscriptionId}` });
          }
        }
      }
      // Old contract route (redirect compatibility)
      else if (pathSegments[2] === 'contract' && params.contractId) {
        breadcrumbs.push({ 
          label: 'Gestion des Contrats',
          path: `/client/${params.clientId}/contracts`
        });
        
        if (params.contractId === 'new') {
          breadcrumbs.push({ label: 'Nouvelle Souscription' });
        } else {
          const souscription = mockSouscriptions.find(s => s.id === params.contractId);
          if (souscription) {
            const template = mockContratsTemplates.find(t => t.id === souscription.contrat_template_id);
            const label = template ? `${souscription.code_souscription} - ${template.intitule}` : souscription.code_souscription;
            breadcrumbs.push({ label });
          } else {
            breadcrumbs.push({ label: `Souscription ${params.contractId}` });
          }
        }
      }
      // Client detail page (360° view)
      else if (pathSegments.length === 2) {
        breadcrumbs.push({ label: 'Dossier Client' });
      }
    }

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  return (
    <div className="min-h-screen relative">
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-background/30">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Building2 className="h-5 w-5 text-primary" />
              <span className="text-lg font-semibold text-foreground">N26²</span>
            </div>
            <Breadcrumb>
              <BreadcrumbList>
                {breadcrumbs.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    {index > 0 && <BreadcrumbSeparator />}
                    <BreadcrumbItem>
                      {item.path ? (
                        <BreadcrumbLink asChild>
                          <Link 
                            to={item.path}
                            className="text-sm text-muted-foreground hover:text-primary transition-colors"
                          >
                            {item.label}
                          </Link>
                        </BreadcrumbLink>
                      ) : (
                        <BreadcrumbPage className="text-sm text-foreground/80">
                          {item.label}
                        </BreadcrumbPage>
                      )}
                    </BreadcrumbItem>
                  </div>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </div>
      </header>
      <main className="pt-24 pb-20 px-8">
        <Outlet />
      </main>
    </div>
  );
}
