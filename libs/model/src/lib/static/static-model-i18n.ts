import { TimeFrame } from './static-model';

//----------------------------------
// FR translations
//----------------------------------

const rightholderRolesFR = {
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

const rightTypesFR = {
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

const statementPartyFR = {
  salesAgent: 'Agent de vente',
  mainDistributor: 'Distributeur',
  producer: 'Bénéficiaire',
  directSales: 'Ventes directes',
} as const;

const amortizationStatusFR = {
  draft: 'Brouillon',
  applied: 'Appliqué',
} as const;

const periodsFR = {
  days: 'Jours',
  weeks: 'Semaines',
  months: 'Mois',
  years: 'Années',
} as const;

const statementTypeFR = {
  salesAgent: 'Agent de vente',
  mainDistributor: 'Distributeur',
  producer: 'Sortant',
  directSales: 'Ventes directes',
} as const;

const statementStatusFR = {
  draft: 'Brouillon',
  pending: 'En attente',
  reported: 'Reporté',
  rejected: 'Rejeté'
} as const;

const documentPathsFR = {
  documents: 'Documents',
  contracts: 'Contrats',
  financingPlan: 'Plan de financement',
  budget: 'Budget'
} as const;

const statementSectionFR = {
  grossReceipts: 'Recettes Brutes',
  netReceipts: 'Recettes Nettes',
} as const;

const invitationTypeFR = {
  attendEvent: 'Participer à l\'événement',
  joinOrganization: 'Rejoindre la société',
  joinWaterfall: 'Rejoindre le Waterfall',
} as const

const invitationStatusFR = {
  accepted: 'Accepté',
  declined: 'Decliné',
  pending: 'En attente'
} as const

const descTimeFramesFR: TimeFrame[] = [
  { type: 'days', from: 0, to: 1, label: `Aujourd'hui`, way: 'desc' },
  { type: 'days', from: -1, to: 0, label: 'Hier', way: 'desc' },
  { type: 'days', from: -2, to: -1, way: 'desc' },
  { type: 'days', from: -3, to: -2, way: 'desc' },
  { type: 'days', from: -4, to: -3, way: 'desc' },
  { type: 'days', from: -5, to: -4, way: 'desc' },
  { type: 'days', from: -6, to: -5, way: 'desc' },
  { type: 'days', from: -7, to: -6, way: 'desc' },
  { type: 'weeks', from: -2, to: -1, label: 'La semaine passée', way: 'desc' },
  { type: 'weeks', from: -3, to: -2, way: 'desc' },
  { type: 'weeks', from: -4, to: -3, way: 'desc' },
  { type: 'months', from: -2, to: -1, label: 'Le mois dernier', way: 'desc' },
  { type: 'months', from: -4, to: -2, label: 'Plus que deux mois', way: 'desc' },
];

const ascTimeFramesFR: TimeFrame[] = [
  { type: 'days', from: 0, to: 1, label: `Aujourd'hui`, way: 'asc' },
  { type: 'days', from: 1, to: 2, label: 'Demain', way: 'asc' },
  { type: 'days', from: 2, to: 3, way: 'asc' },
  { type: 'days', from: 3, to: 4, way: 'asc' },
  { type: 'days', from: 4, to: 5, way: 'asc' },
  { type: 'days', from: 5, to: 6, way: 'asc' },
  { type: 'days', from: 6, to: 7, way: 'asc' },
  { type: 'weeks', from: 1, to: 2, label: 'La semaine prochaine', way: 'asc' },
  { type: 'weeks', from: 2, to: 3, way: 'asc' },
  { type: 'weeks', from: 3, to: 4, way: 'asc' },
  { type: 'months', from: 1, to: 2, label: 'Le mois prochain', way: 'asc' },
  { type: 'months', from: 2, to: 3, way: 'asc' },
  { type: 'months', from: 3, to: 4, way: 'asc' },
];

const timeFramesFR = {
  asc: ascTimeFramesFR,
  desc: descTimeFramesFR,
}

//----------------------------------
// ES translations
//----------------------------------

const rightholderRolesES = {
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

const rightTypesES = {
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

const statementPartyES = {
  salesAgent: 'Agent de vente',
  mainDistributor: 'Distributeur',
  producer: 'Bénéficiaire',
  directSales: 'Ventes directes',
} as const;

const amortizationStatusES = {
  draft: 'Brouillon',
  applied: 'Appliqué',
} as const;

const periodsES = {
  days: 'Jours',
  weeks: 'Semaines',
  months: 'Mois',
  years: 'Années',
} as const;

const statementTypeES = {
  salesAgent: 'Agent de vente',
  mainDistributor: 'Distributeur',
  producer: 'Sortant',
  directSales: 'Ventes directes',
} as const;

const statementStatusES = {
  draft: 'Brouillon',
  pending: 'En attente',
  reported: 'Reporté',
  rejected: 'Rejeté'
} as const;

const documentPathsES = {
  documents: 'Documents',
  contracts: 'Contrats',
  financingPlan: 'Plan de financement',
  budget: 'Budget'
} as const;

const statementSectionES = {
  grossReceipts: 'Recettes Brutes',
  netReceipts: 'Recettes Nettes',
} as const;

const invitationTypeES = {
  attendEvent: 'Attend Event',
  joinOrganization: 'Join Organization',
  joinWaterfall: 'Join Waterfall',
} as const

const invitationStatusES = {
  accepted: 'Accepted',
  declined: 'Declined',
  pending: 'Pending'
} as const

const descTimeFramesES: TimeFrame[] = [
  { type: 'days', from: 0, to: 1, label: 'Today', way: 'desc' },
  { type: 'days', from: -1, to: 0, label: 'Yesterday', way: 'desc' },
  { type: 'days', from: -2, to: -1, way: 'desc' },
  { type: 'days', from: -3, to: -2, way: 'desc' },
  { type: 'days', from: -4, to: -3, way: 'desc' },
  { type: 'days', from: -5, to: -4, way: 'desc' },
  { type: 'days', from: -6, to: -5, way: 'desc' },
  { type: 'days', from: -7, to: -6, way: 'desc' },
  { type: 'weeks', from: -2, to: -1, label: 'Last Week', way: 'desc' },
  { type: 'weeks', from: -3, to: -2, way: 'desc' },
  { type: 'weeks', from: -4, to: -3, way: 'desc' },
  { type: 'months', from: -2, to: -1, label: 'Last Month', way: 'desc' },
  { type: 'months', from: -4, to: -2, label: 'Older than two months', way: 'desc' },
];

const ascTimeFramesES: TimeFrame[] = [
  { type: 'days', from: 0, to: 1, label: 'Today', way: 'asc' },
  { type: 'days', from: 1, to: 2, label: 'Tomorrow', way: 'asc' },
  { type: 'days', from: 2, to: 3, way: 'asc' },
  { type: 'days', from: 3, to: 4, way: 'asc' },
  { type: 'days', from: 4, to: 5, way: 'asc' },
  { type: 'days', from: 5, to: 6, way: 'asc' },
  { type: 'days', from: 6, to: 7, way: 'asc' },
  { type: 'weeks', from: 1, to: 2, label: 'Next Week', way: 'asc' },
  { type: 'weeks', from: 2, to: 3, way: 'asc' },
  { type: 'weeks', from: 3, to: 4, way: 'asc' },
  { type: 'months', from: 1, to: 2, label: 'Next Month', way: 'asc' },
  { type: 'months', from: 2, to: 3, way: 'asc' },
  { type: 'months', from: 3, to: 4, way: 'asc' },
];

const timeFramesES = {
  asc: ascTimeFramesES,
  desc: descTimeFramesES,
}

//----------------------------------
// Mapping
//----------------------------------

export const staticModeli18n = {
  fr: {
    rightholderRoles: rightholderRolesFR,
    rightTypes: rightTypesFR,
    statementParty: statementPartyFR,
    amortizationStatus: amortizationStatusFR,
    periods: periodsFR,
    statementType: statementTypeFR,
    statementStatus: statementStatusFR,
    documentPaths: documentPathsFR,
    statementSection: statementSectionFR,
    invitationType: invitationTypeFR,
    invitationStatus: invitationStatusFR
  },
  es: {
    rightholderRoles: rightholderRolesES,
    rightTypes: rightTypesES,
    statementParty: statementPartyES,
    amortizationStatus: amortizationStatusES,
    periods: periodsES,
    statementType: statementTypeES,
    statementStatus: statementStatusES,
    documentPaths: documentPathsES,
    statementSection: statementSectionES,
    invitationType: invitationTypeES,
    invitationStatus: invitationStatusES
  }
};

export const timeFramesi18n = {
  fr: timeFramesFR,
  es: timeFramesES
}