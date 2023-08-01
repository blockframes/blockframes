import { and, condition, Action, action } from '@blockframes/model';

export const actions: Action[] = [
  // Plan de financement

  // producer
  action('invest', { orgId: 'producer', amount: 0 }),
  action('invest', { orgId: 'Maneki', amount: 0 }),
  action('invest', { orgId: 'playtime', amount: 50_000 }),

  action('append', { id: 'producer', previous: [], orgId: 'producer', percent: 1 }),
  action('append', { id: 'soficinema-3', previous: 'producer', orgId: 'soficinema', percent: 0.04, conditions: and([
    condition('orgRevenu', { orgId: 'soficinema', operator: '>=', target: 165_000 }),
  ]) }),
  action('append', { id: 'soficinema-2', previous: 'soficinema-3', orgId: 'soficinema', percent: 0.1, conditions: and([
    condition('orgRevenu', { orgId: 'soficinema', operator: '>=', target: 115_000 }),
    condition('orgRevenu', { orgId: 'soficinema', operator: '<', target: 165_000 }),
  ])}),

  // Soficinema fr
  action('appendHorizontal', { id: 'soficinema-fr', previous: 'soficinema-2', blameId: 'producer', children: [
    { type: 'right', id: 'soficinema-fr-cine-commercial', orgId: 'soficinema', percent: 0.3, conditions: and([
      condition('terms', { type: 'medias', operator: 'in', list: ['cine-commercial'] }),
      condition('terms', { type: 'territories', operator: 'in', list: ['france'] }),
      condition('orgRevenu', { orgId: 'soficinema', operator: '<', target: 115_000 }),
    ]) },
    { type: 'right', id: 'soficinema-fr-cine-non-commercial', orgId: 'soficinema', percent: 0.5, conditions: and([
      condition('terms', { type: 'medias', operator: 'in',  list: ['cine-non-commercial'] }),
      condition('terms', { type: 'territories', operator: 'in', list: ['france'] }),
      condition('orgRevenu', { orgId: 'soficinema', operator: '<', target: 115_000 }),
    ])},
    { type: 'right', id: 'soficinema-fr-tv', orgId: 'soficinema', percent: 0.85, conditions: and([
      condition('terms', { type: 'medias', operator: 'in',  list: ['tv'] }),
      condition('terms', { type: 'territories', operator: 'in', list: ['france'] }),
      condition('orgRevenu', { orgId: 'soficinema', operator: '<', target: 115_000 }),
    ])},
  ] }),
  // { type: 'right', id: 'soficinema-fr-tv', orgId: 'soficinema', percent: 0.85, conditions: and([
  //   condition('terms', { type: 'medias', operator: 'in',  list: ['tv'] }),
  //   condition('terms', { type: 'territories', operator: 'not-in', list: ['france', 'usa', 'canada'] }),
  //   condition('orgRevenu', { orgId: 'soficinema', operator: '<', target: 115_000 }),
  // ])},
  
  action('append', { id: 'soficinema-row-1', orgId: 'soficinema', previous: 'soficinema-2', percent: 0.15, conditions: and([
    condition('terms', { type: 'territories', operator: 'not-in', list: ['france', 'usa', 'canada'] }),
    condition('orgRevenu', { orgId: 'soficinema', operator: '<', target: 115_000 }),
  ])}),
  action('append', { id: 'soficinema-us', orgId: 'soficinema', previous: 'soficinema-2', percent: 0.9, conditions: and([
    condition('terms', { type: 'territories', operator: 'in', list: ['usa', 'canada'] }),
    condition('orgRevenu', { orgId: 'soficinema', operator: '<', target: 115_000 }),
  ])}),


  // Soficinema row - use/canada/france



  // Soficinema
  // action('invest', { orgId: 'soficinema', amount: 100_000  }),
  // action('prepend', { id: 'financer_0', orgId: 'soficinema', percent: 0.30, next: 'producer', conditions: [{
  //   condition('ref', { id: 'financer_0',  })
  // }]})
  
  
  // Hubert
  // action('invest', { orgId: 'Huber', amount: 20_000  }),
  // action('prepend', { id: 'coprod_0', orgId: 'hubert', percent:  })
  // action('prepend', { id: 'author', orgId: 'hubert',  })

  // UFO
  action('invest', { orgId: 'ufo', amount: 30_000 }),
  action('expense', { orgId: 'ufo', type: 'expense_fr', amount: 88_500 }),
  action('append', { id: 'expense_ufo', orgId: 'ufo', previous: 'soficinema-fr', percent: 1, conditions: and([
    condition('rightRevenu', { rightId: 'expense_ufo', operator: '<', target: 88_500 })
  ]) }),
  action('append', { id: 'mg_ufo', orgId: 'ufo', previous: 'expense_ufo', percent: 1, conditions: and([
    condition('rightRevenu', { rightId: 'mg_ufo', operator: '<', target: 30_000 })
  ])}),
  action('append', { id: 'com_salle_ufo', orgId: 'ufo', previous: 'mg_ufo', percent: 0.25 }),
  action('append', { id: 'com_vod_ufo', orgId: 'ufo', previous: 'mg_ufo', percent: 0.35 }),
  action('append', { id: 'com_dvd_ufo', orgId: 'ufo', previous: 'mg_ufo', percent: 0.75 }),

  // Playtime
  action('appendHorizontal', { id: 'delayed_playtime', blameId: 'playtime', previous: ['soficinema-row-1', 'soficinema-us'], children: [
    { type: 'right', id: 'us_delayed_playtime', orgId: 'playtime', percent: 0.15, conditions: and([
      condition('rightRevenu', { rightId: 'us_delayed_playtime', operator: '<', target: { id: 'us_svod_playtime', percent: 0.15, in: 'rights.turnover'} }),
      condition('contract', { operator: 'not-in', contractIds: ['netflix<->playtime'] }),
    ])},
    { type: 'right', id: 'row_delayed_playtime', orgId: 'playtime', percent: 0.10, conditions: and([
      condition('rightRevenu', { rightId: 'row_delayed_playtime', operator: '<', target: { id: 'row_svod_playtime', percent: 0.1, in: 'rights.turnover'} }),
      condition('contract', { operator: 'not-in', contractIds: ['netflix<->playtime'] }),
    ])},
  ] }),
  action('append', { id: 'mg_playtime', orgId: 'playtime', previous: 'delayed_playtime', percent: 0.7, conditions: and([
    condition('rightRevenu', { rightId: 'mg_playtime', operator: '<', target: 50_000 })
  ])}),

  // Playtime ROW
  // soficinema between expense & mg of playtime
  action('appendVertical', { id: 'soficinema-row', previous: 'mg_playtime', children: [
    { type: 'right', id: 'soficinema-us-1', orgId: 'soficinema', percent: 0.3, conditions: and([
      condition('rightRevenu', { rightId: 'mg_playtime', operator: '<', target: 50_000 }),
      condition('orgRevenu', { orgId: 'soficinema', operator: '<', target: 115_000 }),
    ]) },
    { type: 'right', id: 'soficinema-us-2', orgId: 'soficinema', percent: 0.8, conditions: and([
      condition('orgRevenu', { orgId: 'soficinema', operator: '<', target: 115_000 }),
    ]) },
  ]}),
  action('appendVertical', { id: 'expense_playtime-row', previous: 'soficinema-row', children: [
    { type: 'right', id: 'expense_playtime-row-1', orgId: 'playtime', percent: 1, pools: [''], conditions: and([
      condition('rightRevenu', { rightId: 'expense_playtime-row-1', operator: '<', target: 37_753 + 5_924 }),
    ])},
    { type: 'right', id: 'expense_playtime-row-2', orgId: 'playtime', percent: 1, pools: [''], conditions: and([
      condition('rightRevenu', { rightId: 'expense_playtime-row-2', operator: '<', target: 14_711 }),
    ])},
  ] }),
  action('append', { id: 'row_playtime', orgId: 'playtime', previous: 'expense_playtime', percent: 0.25 }),
  action('append', { id: 'row_svod_playtime', orgId: 'playtime', previous: 'expense_playtime', percent: 0.15 }),
  
  // Playtime US + France
  action('appendVertical', { id: 'expense_playtime', previous: 'mg_playtime', children: [
    { type: 'right', id: 'expense_playtime-1', orgId: 'playtime', percent: 1, pools: [''], conditions: and([
      condition('rightRevenu', { rightId: 'expense_playtime-1', operator: '<', target: 37_753 + 5_924 }),
    ])},
    { type: 'right', id: 'expense_playtime-2', orgId: 'playtime', percent: 1, pools: [''], conditions: and([
      condition('rightRevenu', { rightId: 'expense_playtime-2', operator: '<', target: 14_711 }),
    ])},
  ] }),
  action('append', { id: 'us_playtime', orgId: 'playtime', previous: 'expense_playtime', percent: 0.25 }),
  action('append', { id: 'us_svod_playtime', orgId: 'playtime', previous: 'expense_playtime', percent: 0.1 }),
  action('append', { id: 'festival_playtime', orgId: 'playtime', previous: 'expense_playtime', percent: 0.50 }),
  
  action('append', { id: 'france_svod_playtime', orgId: 'playtime', previous: 'expense_playtime', percent: 0.25 }),
  action('appendHorizontal', { id: 'france_tv_playtime', blameId: 'playtime', previous: 'expense_playtime', children: [
    { type: 'right', id: 'france_tv_10_playtime', orgId: 'playtime', percent: 0.10, conditions: and([
      condition('amount',  { operator: '>=', target: 50_000 })
    ])},
    { type: 'right', id: 'france_tv_15_playtime', orgId: 'playtime', percent: 0.15, conditions: and([
      condition('amount',  { operator: '<', target: 50_000 })
    ])}
  ]}),


  action('append', { id: 'all_madman', orgId: 'madman', previous: 'row_playtime', percent: 1 }),
  action('append', { id: 'all_telepool', orgId: 'telepool', previous: 'row_playtime', percent: 0 }),
  action('append', { id: 'us_netflix', orgId: 'netflix', previous: 'us_svod_playtime', percent: 0 }),
  action('append', { id: 'row_netflix', orgId: 'netflix', previous: 'row_svod_playtime', percent: 0 }),
  action('append', { id: 'all_firstrun', orgId: 'firstrun', previous: 'us_playtime', percent: 0 }),
  action('append', { id: 'all_encoreinflight', orgId: 'encoreinflight', previous: 'row_playtime', percent: 0 }),
  action('append', { id: 'all_festival', orgId: 'festival', previous: 'festival_playtime', percent: 0 }),
  action('append', { id: 'all_orange', orgId: 'orange', previous: 'france_tv_playtime', percent: 0 }),
  
  ////////////
  // INCOME //
  ////////////
  // Netflix
  action('income', { id: 'income_netflix_0', amount: 118_966, contractId: 'netflix<->playtime', from: 'us_netflix', to: 'us_svod_playtime', territories: ['us'], medias: ['svod'] }),
  action('income', { id: 'income_netflix_1', amount: 97_335, contractId: 'netflix<->playtime', from: 'row_netflix', to: 'row_svod_playtime', territories: ['row'], medias: ['svod'] }),

  // Madman
  action('income', { id: 'income_madman_0', amount: 26_077, from: 'all_madman', to: 'row_playtime', territories: ['row'], medias: [''] }),

  // Telepool
  action('income', { id: 'income_telepool_0', amount: 50_000, from: 'all_telepool', to: 'row_playtime', territories: ['row'], medias: [''] }),
  
  // FIRST_RUN
  action('income', { id: 'income_firstrun_0', amount: 1_200, from: 'all_firstrun', to: 'us_playtime', territories: ['us'], medias: [''] }),
  
  // ENCORE_INFLIGHT
  action('income', { id: 'income_encoreinflight_0', amount: 0, from: 'all_encoreinflight', to: 'row_playtime', territories: ['row'], medias: [''] }),
  
  // Festival
  action('income', { id: 'income_festival_0', amount: 1_200, from: 'all_festival', to: 'festival_playtime', territories: ['row'], medias: ['festival'] }),

  // Orange
  action('income', { id: 'income_orange_0', amount: 15_000, from: 'all_orange', to: 'france_tv_playtime', territories: ['france'], medias: ['tv'] }),


  // Netflix (prochaine période)
  action('income', { id: 'income_netflix_2', amount: 24_465, contractId: 'netflix<->playtime', from: 'us_netflix', to: 'us_svod_playtime', territories: ['us'], medias: ['svod'] }),
  action('income', { id: 'income_netflix_3', amount: 20_016, contractId: 'netflix<->playtime', from: 'row_netflix', to: 'row_svod_playtime', territories: ['row'], medias: ['svod'] }),
];