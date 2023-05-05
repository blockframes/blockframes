import { and, condition, Action, action } from '@blockframes/model';

export const initBlock: Action[] = [
  // Plan de financement
  action('invest', { orgId: 'seller_1', amount: 50_000 }),
  action('invest', { orgId: 'investor_1', amount: 150_000 }),
  action('invest', { orgId: 'investor_2', amount: 300_000 }),
  action('invest', { orgId: 'investor_3', amount: 200_000 }),

  // Investors
  action('prepend', { id: 'rnpp', orgId: 'rnpp', next: [], percent: 0 }),
  action('prepend', { id: 'rnpp_investor_1_100k', orgId: 'investor_1', next: 'rnpp', percent: 0.2 }),
  action('prepend', { id: 'rnpp_investor_2_150k', orgId: 'investor_2', next: 'rnpp', percent: 0.5 }),
  action('prepend', { id: 'rnpp_investor_3_120k', orgId: 'investor_3', next: 'rnpp_investor_1_100k', percent: 1 }),

  action('append', { id: 'row_all', orgId: 'x', previous: 'expense_seller_1', percent: 0 }),
];

// Incomes
export const firstIncome: Action[] = [
  action('income', { id: 'income-1', amount: 200_000, from: 'row_all', to: 'expense_seller_1', territory: [], media: [] }),
];

export const secondIncome: Action[] = [
  action('income', { id: 'income-2', amount: 200_000, from: 'row_all', to: 'expense_seller_1', territory: [], media: [] }),
];

const history_1: Action[] = [
  // Seller
  action('append', {
    id: 'expense_seller_1', orgId: 'seller_1', percent: 1, previous: 'rnpp', conditions: and([
      condition('rightRevenu', { rightId: 'expense_seller_1', operator: '<', target: 100_000 })
    ])
  })
];

const history_2: Action[] = [
  // Seller
  action('append', {
    id: 'expense_seller_1', orgId: 'seller_1', percent: 1, previous: 'rnpp', conditions: and([
      condition('rightRevenu', { rightId: 'expense_seller_1', operator: '<', target: 150_000 })
    ])
  })
];

const history_3: Action[] = [
  // Seller
  action('append', {
    id: 'expense_seller_1', orgId: 'seller_1', percent: 1, previous: 'rnpp', conditions: and([
      condition('rightRevenu', { rightId: 'expense_seller_1', operator: '<', target: 120_000 })
    ])
  })
];

export const compensation1: Action[] = [
  // Fork of history 2 with compensations
  // Corrections
  action('income', { id: 'income_correction_1', amount: 50_000, from: 'rnpp', to: 'rnpp_investor_1_100k', territory: [], media: [], isCompensation: true }),
  action('income', { id: 'income_correction_2', amount: -16_000, from: 'rnpp', to: 'rnpp_investor_3_120k', territory: [], media: [], isCompensation: true }),
];

export const stories = [history_1, history_2, history_3];