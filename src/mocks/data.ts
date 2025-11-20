// Types pour les clients
export interface Client {
  id: string;
  numero_client: string;
  denomination: string;
  adresse_principale: string;
  is_personne_morale: boolean;
  segments: string[];
  agence: string;
  conseiller_referent: string;
  telephone?: string;
  email?: string;
  date_creation: string;
  derniere_interaction?: string;
  nombre_contrats: number;
  solde_total: number;
  risque: 'Faible' | 'Modéré' | 'Élevé';
  potentiel: number; // Score de 0 à 100
  statut: 'Actif' | 'Inactif' | 'Prospect';
  cotation?: string;
}

export interface Personne {
  id: string;
  client_id: string;
  prenom: string;
  nom: string;
  date_naissance: string;
  email: string;
  telephone: string;
  role: string;
  situation_familiale?: string;
  adresse?: string;
  revenus?: number;
  charges?: number;
  profession?: string;
  fiscalite?: {
    regime_fiscal?: string;
    taux_imposition?: number;
    nombre_parts?: number;
    revenus_imposables?: number;
  };
  modified_at: string;
  modified_by: string;
}

export interface Offer {
  id: string;
  type: 'contrat' | 'produit';
  nom: string;
  description?: string;
  annotation?: string;
  statut?: 'proposé' | 'accepté' | 'refusé';
}

export interface Contact {
  id: string;
  client_id: string;
  personne_id?: string;
  type: 'commercial' | 'spontané' | 'entretien';
  motif: string;
  commentaire?: string;
  date_contact: string;
  etat: 'planifié' | 'réalisé' | 'annulé';
  agent: string;
  parent_contact_id?: string; // ID du contact qui a déclenché cet entretien
  offers?: Offer[]; // Seulement pour les entretiens réalisés
  commentaire_cloture?: string; // Seulement pour les entretiens réalisés
  created_at: string;
  modified_at: string;
  modified_by?: string;
}

// Listes prédéfinies pour les offres
export const AVAILABLE_CONTRATS = [
  'Assurance Responsabilité Civile Professionnelle',
  'Assurance Cyber-Risques',
  'Assurance Flotte Automobile',
  'Assurance Multirisque Professionnelle',
  'Assurance Protection Juridique',
  'Contrat Téléphonie Mobile',
  'Contrat Internet Fibre',
  'Contrat Énergie Électricité',
  'Contrat Énergie Gaz',
];

export const AVAILABLE_PRODUITS = [
  'Carte Bancaire Premium',
  'Compte Épargne Rémunéré',
  'Prêt Professionnel',
  'Crédit Équipement',
  'Assurance Vie',
  'Plan d\'Épargne Entreprise',
  'Terminal de Paiement',
  'Solution de Gestion de Trésorerie',
];

// ====== CONTRAT TEMPLATE (Catalogue fixe) ======

export interface ContratTemplateOption {
  id: string;
  nom: string;
  description: string;
  prix_mensuel: number;
  prix_annuel: number;
  est_gratuite: boolean;
}

export interface ContratTemplate {
  id: string;
  code_contrat: string;
  intitule: string;
  descriptif: string;
  domaine: 'Assurance' | 'Téléphonie' | 'Énergie' | 'Internet';
  tarif_base_mensuel: number;
  tarif_base_annuel: number;
  options: ContratTemplateOption[]; // Options fixes du contrat
  duree_standard?: number; // Durée par défaut en mois
}

// ====== SOUSCRIPTION (Instance client d'un contrat) ======

export interface SouscriptionOption {
  option_id: string; // Référence à l'option du template
  statut: 'souscrite' | 'non souscrite';
}

export interface Souscription {
  id: string;
  client_id: string;
  contrat_template_id: string; // Référence au template
  code_souscription: string; // Code unique de la souscription
  periodicite: 'mensuelle' | 'annuelle';
  date_souscription: string;
  date_debut?: string;
  date_fin?: string;
  duree?: number; // en mois
  etat: 'actif' | 'planifié' | 'résilié' | 'annulé';
  options_souscrites: SouscriptionOption[]; // Statut des options
  montant_mensuel: number; // Calculé
  montant_annuel: number; // Calculé
  agent_origine: string;
  date_origine: string;
  modified_at?: string;
  modified_by?: string;
}

// Legacy type alias for backward compatibility during migration
export type Contrat = Souscription;

export interface ContratOption {
  id: string;
  nom: string;
  description: string;
  prix_mensuel: number;
  prix_annuel: number;
  est_gratuite: boolean;
  statut: 'souscrite' | 'non souscrite';
}

// Mock data
export const mockClients: Client[] = [
  {
    id: 'CLI001',
    numero_client: 'C2024-00147',
    denomination: 'Entreprise TechnoSolutions SARL',
    adresse_principale: '25 Avenue des Champs-Élysées, 75008 Paris',
    is_personne_morale: true,
    segments: ['PME', 'Tech'],
    agence: 'Paris Centre',
    conseiller_referent: 'Marie Dubois',
    telephone: '01 42 56 78 90',
    email: 'contact@technosolutions.fr',
    date_creation: '2022-03-15',
    derniere_interaction: '2024-11-10',
    nombre_contrats: 8,
    solde_total: 450000,
    risque: 'Faible',
    potentiel: 85,
    statut: 'Actif',
    cotation: 'A+',
  },
  {
    id: 'CLI002',
    numero_client: 'C2023-00892',
    denomination: 'Martin & Associés',
    adresse_principale: '12 Rue de la Paix, 69002 Lyon',
    is_personne_morale: true,
    segments: ['Services', 'Conseil'],
    agence: 'Lyon Bellecour',
    conseiller_referent: 'Pierre Lefebvre',
    telephone: '04 78 92 34 56',
    email: 'info@martin-associes.fr',
    date_creation: '2021-06-20',
    derniere_interaction: '2024-11-15',
    nombre_contrats: 5,
    solde_total: 280000,
    risque: 'Modéré',
    potentiel: 72,
    statut: 'Actif',
    cotation: 'A',
  },
  {
    id: 'CLI003',
    numero_client: 'C2024-01203',
    denomination: 'Sophie Lefèvre',
    adresse_principale: '8 Boulevard Gambetta, 33000 Bordeaux',
    is_personne_morale: false,
    segments: ['Particulier', 'Premium'],
    agence: 'Bordeaux Centre',
    conseiller_referent: 'Jean Moreau',
    telephone: '05 56 78 90 12',
    email: 'sophie.lefevre@email.com',
    date_creation: '2024-01-08',
    derniere_interaction: '2024-11-12',
    nombre_contrats: 3,
    solde_total: 125000,
    risque: 'Faible',
    potentiel: 68,
    statut: 'Actif',
    cotation: 'B+',
  },
  {
    id: 'CLI004',
    numero_client: 'C2022-00456',
    denomination: 'Groupe Immobilier Horizon',
    adresse_principale: '45 Rue du Faubourg Saint-Honoré, 75008 Paris',
    is_personne_morale: true,
    segments: ['Grande Entreprise', 'Immobilier'],
    agence: 'Paris Opéra',
    conseiller_referent: 'Claire Bernard',
    telephone: '01 53 43 21 09',
    email: 'contact@groupe-horizon.fr',
    date_creation: '2020-09-12',
    derniere_interaction: '2024-11-08',
    nombre_contrats: 12,
    solde_total: 1250000,
    risque: 'Modéré',
    potentiel: 92,
    statut: 'Actif',
    cotation: 'A+',
  },
  {
    id: 'CLI005',
    numero_client: 'C2024-00678',
    denomination: 'Julien Mercier',
    adresse_principale: '17 Avenue Jean Jaurès, 31000 Toulouse',
    is_personne_morale: false,
    segments: ['Particulier', 'Standard'],
    agence: 'Toulouse Capitole',
    conseiller_referent: 'Antoine Rousseau',
    telephone: '05 61 23 45 67',
    email: 'j.mercier@email.com',
    date_creation: '2024-02-14',
    derniere_interaction: '2024-11-14',
    nombre_contrats: 2,
    solde_total: 45000,
    risque: 'Faible',
    potentiel: 55,
    statut: 'Actif',
    cotation: 'B',
  },
  {
    id: 'CLI006',
    numero_client: 'C2023-01145',
    denomination: 'Boulangerie Artisanale du Coin',
    adresse_principale: '3 Place du Marché, 13001 Marseille',
    is_personne_morale: true,
    segments: ['TPE', 'Commerce'],
    agence: 'Marseille Vieux-Port',
    conseiller_referent: 'Isabelle Petit',
    telephone: '04 91 33 22 11',
    email: 'boulangerie.artisanale@email.fr',
    date_creation: '2023-05-22',
    derniere_interaction: '2024-10-28',
    nombre_contrats: 4,
    solde_total: 78000,
    risque: 'Élevé',
    potentiel: 48,
    statut: 'Actif',
    cotation: 'C+',
  },
  {
    id: 'CLI007',
    numero_client: 'C2024-00334',
    denomination: 'Émilie Girard',
    adresse_principale: '22 Rue de Strasbourg, 67000 Strasbourg',
    is_personne_morale: false,
    segments: ['Particulier', 'Jeune'],
    agence: 'Strasbourg Centre',
    conseiller_referent: 'Marc Laurent',
    telephone: '03 88 12 34 56',
    email: 'emilie.girard@email.com',
    date_creation: '2024-03-10',
    nombre_contrats: 1,
    solde_total: 15000,
    risque: 'Faible',
    potentiel: 62,
    statut: 'Prospect',
    cotation: 'B-',
  },
  {
    id: 'CLI008',
    numero_client: 'C2021-00923',
    denomination: 'Cabinet Médical Saint-Louis',
    adresse_principale: '56 Boulevard Haussmann, 75009 Paris',
    is_personne_morale: true,
    segments: ['Profession Libérale', 'Santé'],
    agence: 'Paris République',
    conseiller_referent: 'Sophie Martin',
    telephone: '01 48 78 90 12',
    email: 'cabinet.saintlouis@medical.fr',
    date_creation: '2021-04-18',
    derniere_interaction: '2024-11-16',
    nombre_contrats: 6,
    solde_total: 320000,
    risque: 'Faible',
    potentiel: 78,
    statut: 'Actif',
    cotation: 'A',
  },
];

export const mockPersonnes: Personne[] = [
  {
    id: 'PER001',
    client_id: 'CLI001',
    prenom: 'Jean',
    nom: 'Dupont',
    date_naissance: '1975-05-12',
    email: 'jean.dupont@technosolutions.fr',
    telephone: '06 12 34 56 78',
    role: 'Gérant',
    situation_familiale: 'Marié',
    adresse: '15 Rue de la République, 75008 Paris',
    revenus: 85000,
    profession: 'Directeur Général',
    fiscalite: {
      regime_fiscal: 'Régime réel',
      taux_imposition: 30,
      nombre_parts: 2.5,
      revenus_imposables: 78000,
    },
    modified_at: '2024-11-01',
    modified_by: 'Marie Dubois',
  },
  {
    id: 'PER002',
    client_id: 'CLI003',
    prenom: 'Sophie',
    nom: 'Lefèvre',
    date_naissance: '1988-08-23',
    email: 'sophie.lefevre@email.com',
    telephone: '06 78 90 12 34',
    role: 'Titulaire',
    situation_familiale: 'Célibataire',
    adresse: '8 Boulevard Gambetta, 33000 Bordeaux',
    revenus: 52000,
    profession: 'Architecte',
    fiscalite: {
      regime_fiscal: 'Micro-entreprise',
      taux_imposition: 14,
      nombre_parts: 1,
      revenus_imposables: 48000,
    },
    modified_at: '2024-10-15',
    modified_by: 'Jean Moreau',
  },
];

export const mockContacts: Contact[] = [
  {
    id: 'CNT001',
    client_id: 'CLI001',
    type: 'commercial',
    motif: 'Appel de prospection',
    commentaire: '',
    date_contact: '2024-11-10T09:30:00',
    etat: 'réalisé',
    agent: 'Marie Dubois',
    created_at: '2024-11-10T09:30:00',
    modified_at: '2024-11-10T09:30:00',
    modified_by: 'Marie Dubois',
  },
  {
    id: 'CNT002',
    client_id: 'CLI001',
    type: 'entretien',
    motif: 'Bilan annuel des contrats',
    commentaire: '',
    date_contact: '2024-11-25T10:00:00',
    etat: 'planifié',
    agent: 'Marie Dubois',
    parent_contact_id: 'CNT001',
    created_at: '2024-11-10T11:00:00',
    modified_at: '2024-11-10T11:00:00',
    modified_by: 'Marie Dubois',
  },
  {
    id: 'CNT003',
    client_id: 'CLI002',
    type: 'spontané',
    motif: 'Demande d\'information produit',
    commentaire: '',
    date_contact: '2024-11-08T15:20:00',
    etat: 'réalisé',
    agent: 'Pierre Lefebvre',
    created_at: '2024-11-08T15:20:00',
    modified_at: '2024-11-08T15:20:00',
    modified_by: 'Pierre Lefebvre',
  },
  {
    id: 'CNT004',
    client_id: 'CLI002',
    type: 'entretien',
    motif: 'Proposition nouvelle assurance',
    commentaire: 'Client intéressé, en attente de devis',
    date_contact: '2024-11-15T14:00:00',
    etat: 'réalisé',
    agent: 'Pierre Lefebvre',
    parent_contact_id: 'CNT003',
    offers: [
      {
        id: 'OFF001',
        type: 'contrat',
        nom: 'Assurance Cyber-Risques',
        description: 'Protection contre les attaques informatiques',
        annotation: 'Client demande délai de réflexion',
        statut: 'proposé'
      }
    ],
    commentaire_cloture: 'Devis envoyé, relance prévue dans 10 jours',
    created_at: '2024-11-12T09:45:00',
    modified_at: '2024-11-15T14:00:00',
    modified_by: 'Pierre Lefebvre',
  },
];

// ====== CATALOGUE DE CONTRATS (Templates) ======

export const mockContratsTemplates: ContratTemplate[] = [
  {
    id: 'TPL_ASS_RC',
    code_contrat: 'ASS-RC-PRO',
    intitule: 'Assurance Responsabilité Civile Professionnelle',
    descriptif: 'Couverture RC pour activités professionnelles - Protection contre les dommages causés à des tiers dans le cadre de votre activité',
    domaine: 'Assurance',
    tarif_base_mensuel: 200,
    tarif_base_annuel: 2400,
    duree_standard: 12,
    options: [
      {
        id: 'OPT_ASS_RC_001',
        nom: 'Protection Juridique',
        description: 'Assistance juridique en cas de litige',
        prix_mensuel: 50,
        prix_annuel: 600,
        est_gratuite: false,
      },
      {
        id: 'OPT_ASS_RC_002',
        nom: 'Assistance 24/7',
        description: 'Support téléphonique disponible 24h/24',
        prix_mensuel: 0,
        prix_annuel: 0,
        est_gratuite: true,
      },
      {
        id: 'OPT_ASS_RC_003',
        nom: 'Extension Cyber-Risques',
        description: 'Couverture complémentaire contre les attaques informatiques',
        prix_mensuel: 75,
        prix_annuel: 900,
        est_gratuite: false,
      },
    ],
  },
  {
    id: 'TPL_ASS_CYBER',
    code_contrat: 'ASS-CYBER',
    intitule: 'Assurance Cyber-Risques',
    descriptif: 'Protection complète contre les attaques informatiques, violations de données et interruptions d\'activité liées au numérique',
    domaine: 'Assurance',
    tarif_base_mensuel: 150,
    tarif_base_annuel: 1800,
    duree_standard: 12,
    options: [
      {
        id: 'OPT_ASS_CYBER_001',
        nom: 'Audit de Sécurité Annuel',
        description: 'Audit complet de votre infrastructure informatique',
        prix_mensuel: 100,
        prix_annuel: 1200,
        est_gratuite: false,
      },
      {
        id: 'OPT_ASS_CYBER_002',
        nom: 'Formation Personnel',
        description: 'Sessions de formation cybersécurité pour vos équipes',
        prix_mensuel: 50,
        prix_annuel: 600,
        est_gratuite: false,
      },
    ],
  },
  {
    id: 'TPL_ASS_FLOTTE',
    code_contrat: 'ASS-FLOTTE-AUTO',
    intitule: 'Assurance Flotte Automobile',
    descriptif: 'Assurance tous risques pour votre parc de véhicules professionnels (minimum 3 véhicules)',
    domaine: 'Assurance',
    tarif_base_mensuel: 300,
    tarif_base_annuel: 3600,
    duree_standard: 12,
    options: [
      {
        id: 'OPT_ASS_FLOTTE_001',
        nom: 'Véhicule de Remplacement',
        description: 'Mise à disposition d\'un véhicule en cas de panne ou accident',
        prix_mensuel: 80,
        prix_annuel: 960,
        est_gratuite: false,
      },
      {
        id: 'OPT_ASS_FLOTTE_002',
        nom: 'Assistance Dépannage 24/7',
        description: 'Service de dépannage disponible partout en France',
        prix_mensuel: 0,
        prix_annuel: 0,
        est_gratuite: true,
      },
    ],
  },
  {
    id: 'TPL_TEL_MOBILE',
    code_contrat: 'TEL-MOBILE-ENT',
    intitule: 'Pack Téléphonie Mobile Entreprise',
    descriptif: 'Forfaits mobiles illimités pour vos collaborateurs - Appels, SMS et data 4G/5G',
    domaine: 'Téléphonie',
    tarif_base_mensuel: 450,
    tarif_base_annuel: 5400,
    duree_standard: 24,
    options: [
      {
        id: 'OPT_TEL_MOBILE_001',
        nom: 'Roaming International',
        description: 'Appels et data à l\'étranger inclus (Europe + USA)',
        prix_mensuel: 100,
        prix_annuel: 1200,
        est_gratuite: false,
      },
      {
        id: 'OPT_TEL_MOBILE_002',
        nom: 'Téléphones Professionnels',
        description: 'Location de smartphones dernière génération',
        prix_mensuel: 150,
        prix_annuel: 1800,
        est_gratuite: false,
      },
    ],
  },
  {
    id: 'TPL_TEL_FIXE',
    code_contrat: 'TEL-FIXE-ENT',
    intitule: 'Téléphonie Fixe Professionnelle',
    descriptif: 'Standard téléphonique VoIP avec numéros illimités et fonctionnalités avancées',
    domaine: 'Téléphonie',
    tarif_base_mensuel: 250,
    tarif_base_annuel: 3000,
    duree_standard: 36,
    options: [
      {
        id: 'OPT_TEL_FIXE_001',
        nom: 'Serveur Vocal Interactif',
        description: 'SVI personnalisé pour l\'accueil de vos clients',
        prix_mensuel: 75,
        prix_annuel: 900,
        est_gratuite: false,
      },
      {
        id: 'OPT_TEL_FIXE_002',
        nom: 'Enregistrement d\'Appels',
        description: 'Système d\'enregistrement et d\'archivage des communications',
        prix_mensuel: 50,
        prix_annuel: 600,
        est_gratuite: false,
      },
    ],
  },
  {
    id: 'TPL_NET_FIBRE',
    code_contrat: 'NET-FIBRE-PRO',
    intitule: 'Internet Fibre Professionnelle',
    descriptif: 'Connexion fibre optique très haut débit avec garantie de temps de rétablissement',
    domaine: 'Internet',
    tarif_base_mensuel: 150,
    tarif_base_annuel: 1800,
    duree_standard: 12,
    options: [
      {
        id: 'OPT_NET_FIBRE_001',
        nom: 'Débit Garanti',
        description: 'Garantie de débit minimum avec compensation en cas de non-respect',
        prix_mensuel: 100,
        prix_annuel: 1200,
        est_gratuite: false,
      },
      {
        id: 'OPT_NET_FIBRE_002',
        nom: 'IP Fixes',
        description: 'Attribution de 5 adresses IP fixes',
        prix_mensuel: 30,
        prix_annuel: 360,
        est_gratuite: false,
      },
      {
        id: 'OPT_NET_FIBRE_003',
        nom: 'Support Technique 24/7',
        description: 'Assistance technique disponible jour et nuit',
        prix_mensuel: 0,
        prix_annuel: 0,
        est_gratuite: true,
      },
    ],
  },
  {
    id: 'TPL_ENRG_ELEC',
    code_contrat: 'ENRG-ELEC-PRO',
    intitule: 'Contrat Énergie Électricité Professionnelle',
    descriptif: 'Fourniture d\'électricité pour locaux professionnels avec tarifs compétitifs',
    domaine: 'Énergie',
    tarif_base_mensuel: 400,
    tarif_base_annuel: 4800,
    duree_standard: 24,
    options: [
      {
        id: 'OPT_ENRG_ELEC_001',
        nom: 'Énergie Verte',
        description: 'Électricité 100% d\'origine renouvelable',
        prix_mensuel: 50,
        prix_annuel: 600,
        est_gratuite: false,
      },
      {
        id: 'OPT_ENRG_ELEC_002',
        nom: 'Suivi Consommation',
        description: 'Plateforme de monitoring en temps réel de votre consommation',
        prix_mensuel: 0,
        prix_annuel: 0,
        est_gratuite: true,
      },
    ],
  },
  {
    id: 'TPL_ENRG_GAZ',
    code_contrat: 'ENRG-GAZ-PRO',
    intitule: 'Contrat Énergie Gaz Professionnel',
    descriptif: 'Fourniture de gaz naturel pour chauffage et process industriels',
    domaine: 'Énergie',
    tarif_base_mensuel: 350,
    tarif_base_annuel: 4200,
    duree_standard: 24,
    options: [
      {
        id: 'OPT_ENRG_GAZ_001',
        nom: 'Biogaz',
        description: 'Option biogaz pour réduire votre empreinte carbone',
        prix_mensuel: 80,
        prix_annuel: 960,
        est_gratuite: false,
      },
      {
        id: 'OPT_ENRG_GAZ_002',
        nom: 'Prix Fixes',
        description: 'Garantie de prix fixe pendant toute la durée du contrat',
        prix_mensuel: 0,
        prix_annuel: 0,
        est_gratuite: true,
      },
    ],
  },
];

// ====== SOUSCRIPTIONS (Instances client) ======

export const mockSouscriptions: Souscription[] = [
  {
    id: 'SUB001',
    client_id: 'CLI001',
    contrat_template_id: 'TPL_ASS_RC',
    code_souscription: 'ASS-PRO-2024-147',
    periodicite: 'annuelle',
    date_souscription: '2022-03-20',
    date_debut: '2022-04-01',
    duree: 12,
    etat: 'actif',
    options_souscrites: [
      { option_id: 'OPT_ASS_RC_001', statut: 'souscrite' },
      { option_id: 'OPT_ASS_RC_002', statut: 'souscrite' },
      { option_id: 'OPT_ASS_RC_003', statut: 'non souscrite' },
    ],
    montant_mensuel: 250,
    montant_annuel: 3000,
    agent_origine: 'Marie Dubois',
    date_origine: '2022-03-20',
    modified_at: '2024-11-01',
    modified_by: 'Marie Dubois',
  },
  {
    id: 'SUB002',
    client_id: 'CLI001',
    contrat_template_id: 'TPL_TEL_MOBILE',
    code_souscription: 'TEL-ENT-2023-892',
    periodicite: 'mensuelle',
    date_souscription: '2023-01-10',
    date_debut: '2023-02-01',
    duree: 24,
    etat: 'actif',
    options_souscrites: [
      { option_id: 'OPT_TEL_MOBILE_001', statut: 'non souscrite' },
      { option_id: 'OPT_TEL_MOBILE_002', statut: 'non souscrite' },
    ],
    montant_mensuel: 450,
    montant_annuel: 5400,
    agent_origine: 'Marie Dubois',
    date_origine: '2023-01-10',
    modified_at: '2023-01-10',
    modified_by: 'Marie Dubois',
  },
];

// Alias pour compatibilité backward (à supprimer progressivement)
export const mockContrats: Contrat[] = mockSouscriptions;
