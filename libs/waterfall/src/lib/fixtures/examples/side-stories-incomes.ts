import { Action, action } from '../../action';

const history_1: Action[] = [
  action('append', { id: 'investor_1_rnpp', orgId: 'investor_1', percent: 0.3, previous: [] }),
  action('append', { id: 'investor_2_com', orgId: 'investor_2', percent: 0.15, previous: ['investor_3_expense'] }),
  action('append', { id: 'investor_3_expense', orgId: 'investor_3', percent: 1, previous: [] }),

  action('income', { id: 'seller_1', amount: 20_000, from: 'seller_1', to: 'investor_1_rnpp', territory: [], media: [] }),
  action('income', { id: 'seller_2', amount: 10_000, from: 'seller_2', to: 'investor_2_com', territory: [], media: [] }),
];

const history_2: Action[] = [
  action('append', { id: 'income_distributor', orgId: 'investor_2', percent: 0, previous: ['income_resolver_1', 'income_resolver_2'] }),

  action('append', { id: 'investor_1_rnpp', orgId: 'investor_1', percent: 0.3, previous: [] }),

  action('appendHorizontal', {
    id: 'income_resolver_1', blameId: 'investor_2', previous: [], percent: 1, children: [
      { type: 'right', id: 'investor_1_rnpp', orgId: 'investor_1', percent: 0.3 },
    ]
  }),

  action('appendHorizontal', {
    id: 'income_resolver_2', blameId: 'investor_2', previous: ['investor_3_expense'], percent: 0.5, children: [
      { type: 'right', id: 'investor_2_com', orgId: 'investor_2', percent: 0.15 },
    ]
  }),

  action('append', { id: 'investor_3_expense', orgId: 'investor_3', percent: 1, previous: [] }),
  action('income', { id: 'income_all_1', amount: 20_000, from: 'seller_1', to: 'income_distributor', territory: [], media: [] }),
  action('income', { id: 'income_all_compensation_1', amount: -10_000, from: 'investor_2_com', to: 'investor_3_expense', territory: [], media: [], isCompensation: true }),
];

const next_1: Action[] = [
  action('income', { id: 'seller_1_b', amount: 40_000, from: 'seller_1', to: 'investor_1_rnpp', territory: [], media: [] }),
  action('income', { id: 'seller_2_b', amount: 20_000, from: 'seller_2', to: 'investor_2_com', territory: [], media: [] }),
]

const next_2: Action[] = [
  action('updateRight', { id: 'income_resolver_1', percent: (4 * 10) / 70, date: new Date() }),
  action('updateRight', { id: 'income_resolver_2', percent: (2 * 10) / 70, date: new Date() }),
  action('income', { id: 'income_all_2', amount: 70_000, from: 'seller_1', to: 'income_distributor', territory: [], media: [] }),
  action('income', { id: 'income_all_compensation_2', amount: -50_000, from: 'investor_2_com', to: 'investor_3_expense', territory: [], media: [], isCompensation: true }),
]

export const stories = [history_1, history_2];
export const next = [next_1, next_2];