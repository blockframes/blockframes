const rightholderRoles = {
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
  investments: 'Récupération de l\'investissement',
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

const periods = {
  days: 'Jours',
  weeks: 'Semaines',
  months: 'Mois',
  years: 'Années',
} as const;

const statementType = {
  salesAgent: 'Agent de vente',
  mainDistributor: 'Distributeur',
  producer: 'Sortant',
  directSales: 'Ventes directes',
} as const;

const statementStatus = {
  draft: 'Brouillon',
  pending: 'En attente',
  reported: 'Reporté',
  rejected: 'Rejeté'
} as const;

export const staticModeli18n = {
  fr: {
    rightholderRoles,
    rightTypes,
    statementParty,
    amortizationStatus,
    periods,
    statementType,
    statementStatus
  }
};
