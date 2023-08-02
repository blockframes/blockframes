import { and, condition, Action, action } from '@blockframes/model';

export const initBlock: Action[] = [
  // Plan de financement
  action('prepend', { id: 'rnpp', orgId: 'rnpp', next: [], percent: 0 }),
  action('invest', { orgId: 'seller_1', amount: 50_000 }),
  action('invest', { orgId: 'investor_1', amount: 150_000 }),
  action('invest', { orgId: 'investor_2', amount: 300_000 }),
  action('invest', { orgId: 'investor_3', amount: 200_000 }),
  action('invest', { orgId: 'investor_4', amount: 200_000 }),
  action('append', { id: 'row_all', orgId: 'x', previous: 'mg_seller_1', percent: 0 }),
];

// Rnpp 
export const rnpp: Action[] = [
  action('prependVertical', {
    id: 'rnpp_investor_1',
    next: 'rnpp',
    children: [
      {
        type: 'right', id: 'rnpp_investor_1_a', orgId: 'investor_1', percent: 0.2, pools: ['rnpp_investor_1'], conditions: and([
          condition('poolRevenu', { pool: 'rnpp_investor_1', operator: '<', target: 19_000 })
        ])
      },
      { type: 'right', id: 'rnpp_investor_1_b', orgId: 'investor_1', percent: 0.1, pools: ['rnpp_investor_1'] }
    ]
  }),
  action('prepend', { id: 'rnpp_investor_2', orgId: 'investor_2', next: 'rnpp', percent: 0.5 }),
  action('prepend', { id: 'rnpp_investor_3', orgId: 'investor_3', next: 'rnpp_investor_1', percent: 0.5 }),
  action('prepend', { id: 'rnpp_investor_4', orgId: 'investor_4', next: 'rnpp_investor_3', percent: 1 }),
];

// Incomes
export const firstIncome: Action[] = [
  action('income', { id: 'income-1', amount: 70_000, from: 'row_all', to: 'mg_seller_1', territories: [], medias: [] }),
];

export const secondIncome: Action[] = [
  action('income', { id: 'income-2', amount: 100_000, from: 'row_all', to: 'mg_seller_1', territories: [], medias: [] }),
];

const history_1: Action[] = [
  // Sellers
  action('append', {
    id: 'mg_seller_1', orgId: 'seller_1', percent: 1, previous: 'rnpp', conditions: and([
      condition('rightRevenu', { rightId: 'mg_seller_1', operator: '<', target: 50_000 })
    ])
  }),
];

const history_2: Action[] = [
  // Sellers
  action('append', {
    id: 'mg_seller_1', orgId: 'seller_1', percent: 1, previous: 'rnpp', conditions: and([
      condition('rightRevenu', { rightId: 'mg_seller_1', operator: '<', target: 80_000 })
    ])
  }),
];

export const compensation1: Action[] = [
  // Fork of history 1 with compensations
  // Corrections
  action('income', { id: 'income_correction_1', amount: -20_000, from: 'rnpp', to: 'rnpp_investor_1', territories: [], medias: [], isCompensation: true }),
  action('income', { id: 'income_correction_2', amount: 16_000, from: 'rnpp', to: 'rnpp_investor_3', territories: [], medias: [], isCompensation: true }),
];

export const compensation2: Action[] = [
  // Fork of history 1 with compensations
  // Corrections
  action('income', { id: 'income_correction_3', amount: -15_000, from: 'rnpp', to: 'rnpp_investor_1', territories: [], medias: [], isCompensation: true }),
  action('income', { id: 'income_correction_4', amount: 15_500, from: 'rnpp', to: 'rnpp_investor_3', territories: [], medias: [], isCompensation: true }),
];

export const stories = [history_1, history_2];