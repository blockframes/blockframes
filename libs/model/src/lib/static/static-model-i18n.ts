const rightholderRoles = { // TODO #9699 remove comment
  salesAgent: 'Agent de vente',
  mainDistributor: 'Distributeur principal',
  localDistributor: 'Distributeur local',
  sale: 'Diffuseur',
  producer: 'Producteur',
  author: 'Auteur',
  agent: 'Agent',
  coProducer: 'Co-producteur',
  financier: 'Financier',
  institution: 'Institution',
  performer: 'Cast',
  other: 'Autre'
} as const

const rightTypes = {
  commission: 'Commission',
  expenses: 'Récupération des frais',
  mg: 'Récupération MG',
  horizontal: 'Groupe horizontal',
  vertical: 'Groupe vertical',
  rnpp: 'RNPP',
  investments: 'Récupération de l'investissement',
  residuals: 'Residuals',
  royalties: 'Royalties',
  unknown: 'Autre'
} as const

const statementParty = {
  salesAgent: 'Agent de vente',
  mainDistributor: 'Distributeur',
  producer: 'Bénéficiaire',
  directSales: 'Ventes directes',
} as const;

const amortizationStatus = {
  draft: 'Brouillon',
  applied: 'Appliqué',
} as const;

export const staticModeli18n = {
  fr: {
    rightholderRoles,
    rightTypes,
    statementParty,
    amortizationStatus
  }
};
