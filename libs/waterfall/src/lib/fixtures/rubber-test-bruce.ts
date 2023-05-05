import { and, condition, Action, action } from '@blockframes/model';

const investments: Action[] = [
  action('invest', { orgId: 'realistism', amount: 156_696 }),
  action('invest', { orgId: 'elledriver', amount: 14_400 }),
  action('invest', { orgId: 'elledriver', amount: 31_700 }),
  action('invest', { orgId: 'garysindo', amount: 144_684 }),
  action('invest', { orgId: 'arte', amount: 120_000 }),
  action('invest', { orgId: 'arte', amount: 120_000 }),
  action('invest', { orgId: 'canal', amount: 171_764 }),
  action('invest', { orgId: 'cine+', amount: 30_100 }),
]

const sellers: Action[] = [

  // cine_cnc
  action('append', { id: 'cine_cnc', orgId: 'cnc', percent: 0.1, previous: ['cine_author', 'cine_theater'] }),

  // cine_theater
  action('append', { id: 'cine_theater', orgId: 'fr_theater', percent: 0.5, previous: ['com_cine_commercial_ufo'] }),
  action('append', { id: 'com_cine_commercial_ufo', orgId: 'ufo', percent: 0.25, previous: ['expense_cine_commercial_ufo'] }),
  action('append', {
    id: 'expense_cine_commercial_ufo', orgId: 'ufo', percent: 1, previous: ['rnpp'], conditions: and([
      condition('rightRevenu', { rightId: 'expense_cine_commercial_ufo', operator: '<', target: 108_000 })
    ])
  }),

  // fr_tv
  action('append', { id: 'ufo_com', orgId: 'ufo', percent: 0.1, previous: ['rnpp'] }),

  // fr_rent
  action('append', { id: 'rent_rd', orgId: 'rd', percent: 0.7, previous: ['rnpp'] }),

  // fr_collector
  action('append', { id: 'collector_rd', orgId: 'rd', percent: 0.8, previous: ['rnpp'] }),

  // fr_sell
  action('appendVertical', {
    id: 'sell_rd', previous: ['rnpp'], children: [
      {
        type: 'right', id: 'sell_2_rd', orgId: 'rd', percent: 0.7, conditions: and([
          condition('event', { eventId: 'fr_dvd_sold', operator: '>=', value: 4_000 })
        ])
      },
      { type: 'right', id: 'sell_1_rd', orgId: 'rd', percent: 0.8 },
    ]
  }),

  // fr_vod
  action('append', { id: 'vod_rd', orgId: 'rd', percent: 0.4, previous: ['rnpp'] }),

  // fr_svod
  action('append', { id: 'svod_rd', orgId: 'rd', percent: 0.17, previous: ['rnpp'] }),

  // row_all
  action('append', { id: 'com_elledriver', orgId: 'elledriver', percent: 0.25, pools: ['income_seller'], previous: ['expense_elledriver'] }),
  action('append', {
    id: 'expense_elledriver', orgId: 'elledriver', percent: 1, previous: ['mg_elledriver'], conditions: and([
      condition('rightRevenu', { rightId: 'expense_elledriver', operator: '<', target: 52_034 })
    ])
  }),
  action('append', {
    id: 'mg_elledriver', orgId: 'elledriver', percent: 1, previous: ['row_author'], conditions: and([
      condition('rightRevenu', { rightId: 'mg_elledriver', operator: '<', target: 31_514 })
    ])
  }),

  action('appendHorizontal', {
    id: 'row_author', blameId: 'realistism', previous: 'rnpp', children: [
      {
        type: 'right', id: 'row_all_except_tv_author', orgId: 'author', percent: 0.05, conditions: and([
          condition('orgTurnover', { orgId: 'author', operator: '>=', target: 11_000 }),
          condition('terms', { type: 'media', operator: 'not-in', list: ['tv'] }),
        ])
      },
      {
        type: 'right', id: 'row_tv_author', orgId: 'author', percent: 0.01, conditions: and([
          condition('orgTurnover', { orgId: 'author', operator: '>=', target: 11_000 }),
          condition('terms', { type: 'media', operator: 'in', list: ['tv'] }),
          condition('terms', { type: 'territory', operator: 'not-in', list: ['france', 'germany'] }),
        ])
      }
    ]
  }),

  // world_festival
  action('append', { id: 'festival_elledriver', orgId: 'elledriver', percent: 1, pools: ['income_seller'], previous: ['expense_elledriver'] }),

  // cine_theater_non_com
  action('append', { id: 'com_cine_non_commercial_ufo', orgId: 'ufo', percent: 0.25, previous: ['expense_cine_non_commercial_ufo'] }),
  action('append', {
    id: 'expense_cine_non_commercial_ufo', orgId: 'ufo', percent: 1, previous: ['com_cine_non_commercial_author'], conditions: and([
      condition('orgRevenu', { orgId: 'ufo', operator: '<', target: 108_000 })
    ])
  }),
  action('append', {
    id: 'com_cine_non_commercial_author', orgId: 'author', percent: 0.03, previous: ['rnpp'], conditions: and([
      condition('orgTurnover', { orgId: 'author', operator: '>=', target: 11_000 })
    ])
  }),

  // music
  action('append', { id: 'com_music', orgId: 'music', percent: 1, previous: 'rnpp' }),
];


const rnpp: Action[] = [
  // cnc
  action('appendHorizontal', {
    id: 'cnc_support', blameId: 'realistism', previous: [], children: [
      {
        type: 'vertical', id: 'arte_support', children: [
          {
            type: 'right', id: 'arte_support_1', orgId: 'arte', percent: 0.2, pools: ['rnpp'], conditions: and([
              condition('rightTurnover', { rightId: 'cnc_support', operator: '>=', target: 50_000 }),
              condition('poolRevenu', { pool: 'rnpp', operator: '<', target: 70_000 }),
            ]),
          },
          {
            type: 'right', id: 'arte_support_2', orgId: 'arte', percent: 0.15, pools: ['rnpp'], conditions: and([
              condition('rightTurnover', { rightId: 'cnc_support', operator: '>=', target: 50_000 }),
              condition('poolRevenu', { pool: 'rnpp', operator: '<', target: 120_000 }),
            ])
          }
        ]
      },
      {
        type: 'vertical', id: 'elledriver_support', children: [
          {
            type: 'right', id: 'elledriver_support_1', orgId: 'elledriver', percent: 0.04, conditions: and([
              condition('rightRevenu', { rightId: 'rnpp_rest_elledriver', operator: '>=', target: 14_400 }),
              condition('poolTurnover', { pool: 'income_seller', operator: '<', target: 300_000 })
            ]),
          },
          {
            type: 'right', id: 'elledriver_support_2', orgId: 'elledriver', percent: 0.09, conditions: and([
              condition('rightRevenu', { rightId: 'rnpp_rest_elledriver', operator: '>=', target: 14_400 }),
              condition('poolTurnover', { pool: 'income_seller', operator: '<', target: 1_000_000 })
            ]),
          },
          {
            type: 'right', id: 'elledriver_support_3', orgId: 'elledriver', percent: 0.12, conditions: and([
              condition('rightRevenu', { rightId: 'rnpp_rest_elledriver', operator: '>=', target: 14_400 }),
              condition('poolTurnover', { pool: 'income_seller', operator: '<', target: 1_300_000 })
            ]),
          },
          {
            type: 'right', id: 'elledriver_support_4', orgId: 'elledriver', percent: 0.14, conditions: and([
              condition('rightRevenu', { rightId: 'rnpp_rest_elledriver', operator: '>=', target: 14_400 }),
            ]),
          },
        ]
      },
    ]
  }),

  // rnpp
  action('appendHorizontal', {
    id: 'rnpp', blameId: 'realistism', previous: [], children: [
      {
        type: 'right', id: 'extract_author', orgId: 'author', percent: 0.01, conditions: and([
          condition('terms', { type: 'media', operator: 'in', list: ['extract'] }),
          condition('terms', { type: 'territory', operator: 'in', list: ['france'] }),
        ])
      },
      {
        type: 'vertical', id: 'rnpp_arte', children: [
          {
            type: 'right', id: 'rnpp_arte_1', orgId: 'arte', percent: 0.2, pools: ['rnpp'], conditions: and([
              condition('poolRevenu', { pool: 'rnpp', operator: '<', target: 70_000 })
            ]),
          },
          {
            type: 'right', id: 'rnpp_arte_2', orgId: 'arte', percent: 0.15, pools: ['rnpp'], conditions: and([
              condition('poolRevenu', { pool: 'rnpp', operator: '<', target: 120_000 })
            ]),
          },
          {
            type: 'right', id: 'rnpp_arte_3', orgId: 'arte', percent: 0.1, pools: ['rnpp'],
          },
        ]
      },
      {
        type: 'vertical', id: 'rnpp_garysindo', children: [
          {
            type: 'right', id: 'rnpp_garysindo_1', orgId: 'garysindo', percent: 0.75, conditions: and([
              condition('rightRevenu', { rightId: 'rnpp_garysindo', operator: '<', target: 144_684 })
            ]),
          },
          {
            type: 'right', id: 'rnpp_garysindo_2', orgId: 'garysindo', percent: 0.2
          },
        ]
      },
      {
        type: 'vertical', id: 'rnpp_elledriver', children: [
          {
            type: 'right', id: 'rnpp_elledriver_1', orgId: 'elledriver', percent: 0.04, conditions: and([
              condition('rightRevenu', { rightId: 'rnpp_rest_elledriver', operator: '>=', target: 14_400 }),
              condition('poolTurnover', { pool: 'income_seller', operator: '<', target: 300_000 })
            ]),
          },
          {
            type: 'right', id: 'rnpp_elledriver_2', orgId: 'elledriver', percent: 0.09, conditions: and([
              condition('rightRevenu', { rightId: 'rnpp_rest_elledriver', operator: '>=', target: 14_400 }),
              condition('poolTurnover', { pool: 'income_seller', operator: '<', target: 1_000_000 })
            ]),
          },
          {
            type: 'right', id: 'rnpp_elledriver_3', orgId: 'elledriver', percent: 0.12, conditions: and([
              condition('rightRevenu', { rightId: 'rnpp_rest_elledriver', operator: '>=', target: 14_400 }),
              condition('poolTurnover', { pool: 'income_seller', operator: '<', target: 1_300_000 })
            ]),
          },
          {
            type: 'right', id: 'rnpp_elledriver_4', orgId: 'elledriver', percent: 0.14, conditions: and([
              condition('rightRevenu', { rightId: 'rnpp_rest_elledriver', operator: '>=', target: 14_400 }),
            ]),
          },
        ]
      },
    ]
  }),
];

const rest: Action[] = [
  action('prepend', {
    id: 'rnpp_rest_elledriver', orgId: 'elledriver', percent: 1, next: ['cnc_support', 'rnpp'], conditions: and([
      condition('rightRevenu', { rightId: 'rnpp_rest_elledriver', operator: '<', target: 14_400 })
    ])
  }),

  action('prepend', { id: 'rnpp_rest_realistism', orgId: 'realistism', next: ['rnpp_rest_elledriver'], percent: 1 }),
];

const others: Action[] = [
  action('append', { id: 'cine_author', orgId: 'author', percent: 0.005, previous: [] }),
];

const incomes: Action[] = [
  action('income', { id: 'cine_cnc', amount: 0, from: 'cine_cnc', to: 'cine_cnc', territory: [], media: [] }),
  action('income', { id: 'cine_theater', amount: 115_969, from: 'cine_theater', to: 'com_cine_commercial_ufo', territory: ['france'], media: ['salle'] }),
  action('income', { id: 'fr_tv', amount: 10_000, from: 'fr_tv', to: 'ufo_com', territory: ['france'], media: ['tv'] }),
  action('income', { id: 'extract_tv', amount: 250, from: 'extract_tv', to: 'rnpp', territory: ['france'], media: ['tv'] }),
  action('income', { id: 'fr_rent', amount: 5_290, from: 'fr_rent', to: 'rent_rd', territory: ['france'], media: ['dvd'] }),
  action('income', { id: 'fr_collector', amount: 24_125, from: 'fr_collector', to: 'collector_rd', territory: ['france'], media: ['dvd'] }),
  action('income', { id: 'fr_sell_a', amount: 6_650, from: 'fr_sell', to: 'sell_rd', territory: ['france'], media: ['dvd'] }),
  action('emitEvent', { eventId: 'fr_dvd_sold', value: 4_344 }),
  action('income', { id: 'fr_sell_b', amount: 22_433, from: 'fr_sell', to: 'sell_rd', territory: ['france'], media: ['dvd'] }),
  action('income', { id: 'fr_vod', amount: 3_948, from: 'fr_vod', to: 'vod_rd', territory: ['france'], media: ['vod'] }),
  action('income', { id: 'fr_svod', amount: 2_000, from: 'fr_svod', to: 'svod_rd', territory: ['france'], media: ['svod'] }),
  action('income', { id: 'row_all', amount: 380_739, from: 'row_all', to: 'com_elledriver', territory: ['world'], media: ['vod', 'tv', 'salle', 'svod', 'dvd'] }),
  action('income', { id: 'music', amount: 0, from: 'music', to: 'com_music', territory: ['world'], media: ['cd'] }),
  action('income', { id: 'cnc', amount: 31_992, from: 'cnc', to: 'cnc_support', territory: ['france'], media: [] }),
  action('income', { id: 'world_festival', amount: 0, from: 'world_festival', to: 'festival_elledriver', territory: ['world'], media: ['festival'] }),
  action('income', { id: 'cine_theater_non_com', amount: 0, from: 'cine_theater_non_com', to: 'com_cine_non_commercial_ufo', territory: ['france'], media: ['salle-non-com'] }),
];

export const actions = [...investments, ...sellers, ...rnpp, ...others, ...rest, ...incomes];
