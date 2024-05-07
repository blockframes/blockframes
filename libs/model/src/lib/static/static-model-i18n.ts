const rightholderRoles = {  // TODO remove comment
  salesAgent: 'Sales Agent',
  mainDistributor: 'Main Distributor',
  localDistributor: 'Local Distributor',
  sale: 'Broadcaster',
  producer: 'Producer',
  author: 'Author',
  agent: 'Agent',
  coProducer: 'Co-Producer',
  financier: 'Financier',
  institution: 'Institution',
  performer: 'Cast',
  other: 'Autre'
} as const

const rightTypes = {
  commission: 'Commission',
  expenses: 'Expenses Recoupment',
  mg: 'MG Recoupment',
  horizontal: 'Horizontal Group',
  vertical: 'Vertical Group',
  rnpp: 'Producer\'s Net Participation',
  investments: 'Investment Recoupment',
  residuals: 'Residuals',
  royalties: 'Royalties',
  unknown: 'Autre'
} as const

const statementParty = {
  salesAgent: 'Sales Agent',
  mainDistributor: 'Distributor',
  producer: 'Beneficiary',
  directSales: 'Direct Sales',
} as const;

const amortizationStatus = {
  draft: 'Draft',
  applied: 'Applied',
} as const;

export const staticModeli18n = {
  fr: {
    rightholderRoles,
    rightTypes,
    statementParty,
    amortizationStatus
  }
};
