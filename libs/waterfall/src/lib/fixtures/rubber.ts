import { and, condition, Action, action } from '@blockframes/model';

export const actions: Action[] = [

  action('invest', { orgId: 'realistism', amount: 156_696 }),
  action('invest', { orgId: 'elledriver', amount: 14_400 }),
  action('invest', { orgId: 'elledriver', amount: 31_700 }),
  action('invest', { orgId: 'garysindo', amount: 144_684 }),
  action('invest', { orgId: 'arte', amount: 120_000 }),
  action('invest', { orgId: 'arte', amount: 120_000 }),
  action('invest', { orgId: 'canal', amount: 171_764 }),
  action('invest', { orgId: 'cine+', amount: 30_100 }),

  action('prepend', { id: 'rnpp', orgId: 'realistism', next: [], percent: 0}),
  action('prepend', { id: 'cnc_support', orgId: 'cnc', next: [], percent: 0}),

  action('prepend', { id: 'extract_author', orgId: 'author', next: 'rnpp', percent: 0.01, conditions: and([
    condition('terms', { type: 'medias', operator: 'in', list: ['extract'] }),
    condition('terms', { type: 'territories', operator: 'in', list: ['france'] }),
  ]) }),

  // Arte
  action('prepend', { id: 'rnpp_arte', orgId: 'arte', next: 'rnpp', percent: 0.2, pools: ['rnpp'], conditions: and([
    condition('contract', { operator: 'not-in', contractIds: ['cnc_support<->rnpp'] }),
    condition('poolRevenu', { pool: 'rnpp', operator: '<', target: 70_000 }),
  ]) }),
  
  action('prepend', { id: 'support_arte', orgId: 'arte', next: 'rnpp', percent: 0.2, pools: ['rnpp'], conditions: and([
    condition('rightTurnover', { rightId: 'support_arte', operator: '>=', target: 50_000 }),
    condition('contract', { operator: 'in', contractIds: ['cnc_support<->rnpp'] }),
    condition('poolRevenu', { pool: 'rnpp', operator: '<', target: 70_000 }), // rnpp < 70_000 : arte
  ]) }),
  
  action('prepend', { id: 'rnpp_2_arte', orgId: 'arte', next: ['rnpp_arte', 'support_arte'], percent: 0.15, pools: ['rnpp'], conditions: and([
    condition('poolRevenu', { pool: 'rnpp', operator: '<', target: 120_000 }),
  ]) }),
  
  action('prepend', { id: 'rnpp_3_arte', orgId: 'arte', next: 'rnpp_2_arte', percent: 0.1 }),

  // Garry sindo
  action('prepend', { id: 'rnpp_garysindo', orgId: 'garysindo', next: 'rnpp', percent: 0.75, conditions: and([
    condition('contract', { operator: 'not-in', contractIds: ['cnc_support<->rnpp'] }),
    condition('rightRevenu', { rightId: 'rnpp_garysindo', operator: '<', target: 144_684 })
  ]) }),
  action('prepend', { id: 'rnpp_2_garysindo', orgId: 'garysindo', next: 'rnpp_garysindo', percent: 0.2 }),

  // Elledriver
  action('prepend', { id: 'rnpp_elledriver', orgId: 'elledriver', next: ['rnpp_3_arte', 'rnpp_2_garysindo', 'extract_author'], percent: 1, conditions: and([
    condition('rightRevenu', { rightId: 'rnpp_elledriver', operator: '<', target: 14_400 })
  ]) }),
  action('prepend', { id: 'rnpp_2_elledriver', orgId: 'elledriver', next: 'rnpp', percent: 0.04, conditions: and([
    condition('rightRevenu', { rightId: 'rnpp_elledriver', operator: '>=', target: 14_400 }),
    condition('poolTurnover', { pool: 'income_seller', operator: '<', target: 300_000 })
  ]) }),
  action('prepend', { id: 'rnpp_3_elledriver', orgId: 'elledriver', next: 'rnpp_2_elledriver', percent: 0.09, conditions: and([
    condition('rightRevenu', { rightId: 'rnpp_elledriver', operator: '>=', target: 14_400 }),
    condition('poolTurnover', { pool: 'income_seller', operator: '<', target: 1_000_000 })
  ]) }),
  action('prepend', { id: 'rnpp_4_elledriver', orgId: 'elledriver', next: 'rnpp_3_elledriver', percent: 0.12, conditions: and([
    condition('rightRevenu', { rightId: 'rnpp_elledriver', operator: '>=', target: 14_400 }),
    condition('poolTurnover', { pool: 'income_seller', operator: '<', target: 1_300_000 })
  ]) }),
  action('prepend', { id: 'rnpp_5_elledriver', orgId: 'elledriver', next: 'rnpp_4_elledriver', percent: 0.14, conditions: and([
    condition('rightRevenu', { rightId: 'rnpp_elledriver', operator: '>=', target: 14_400 }),
  ]) }),

  // France cine commercial
  action('append', { id: 'expense_cine_commercial_ufo', orgId: 'ufo', percent: 1, previous: 'rnpp', conditions: and([
    condition('orgRevenu', { orgId: 'ufo', operator: '<', target: 108_000 })
  ]) }),
  action('append', { id: 'com_cine_commercial_ufo', orgId: 'ufo', percent: 0.25, previous: 'expense_cine_commercial_ufo' }),
  action('append', { id: 'cine_theater', orgId: 'fr_theater', percent: 0.5, previous: 'com_cine_commercial_ufo' }),
  action('append', { id: 'cine_cnc', orgId: 'cnc', percent: 0.1, previous: 'cine_theater' }),
  action('prepend', { id: 'cine_author', orgId: 'author', percent: 0.005, next: 'cine_cnc', conditions: and([
    condition('orgTurnover', { orgId: 'author', operator: '>=', target: 11_000 })
  ])}),

  // France cine non commercial
  action('append', { id: 'com_cine_non_commercial_author', orgId: 'author', percent: 0.003, previous: 'rnpp', conditions: and([
    condition('orgTurnover', { orgId: 'author', operator: '>=', target: 11_000 })
  ])}),
  action('append', { id: 'expense_cine_non_commercial_ufo', orgId: 'ufo', percent: 1, previous: 'com_cine_non_commercial_author', conditions: and([
    condition('orgRevenu', { orgId: 'ufo', operator: '<', target: 108_000 })
  ]) }),
  action('append', { id: 'com_cine_non_commercial_ufo', orgId: 'ufo', percent: 0.25, previous: 'expense_cine_non_commercial_ufo' }),
  
  // France dvd/vod
  action('appendHorizontal', { id: 'sell_rd', blameId: 'realistism', previous: 'rnpp', children: [
    { type: 'right', id: 'sell_1_rd', orgId: 'rd', percent: 0.8, conditions: and([
      condition('event', { eventId: 'fr_dvd_sold', operator: '<', value: 4_000 })
    ])},
    { type: 'right', id: 'sell_2_rd', orgId: 'rd', percent: 0.7, conditions: and([
      condition('event', { eventId: 'fr_dvd_sold', operator: '>=', value: 4_000 })
    ])},
  ]}),
  action('append', { id: 'collector_rd', orgId: 'rd', percent: 0.8, previous: 'rnpp'}),
  action('append', { id: 'rent_rd', orgId: 'rd', percent: 0.7, previous: 'rnpp'}),
  action('append', { id: 'vod_rd', orgId: 'rd', percent: 0.4, previous: 'rnpp'}),
  action('append', { id: 'svod_rd', orgId: 'rd', percent: 0.17, previous: 'rnpp'}),

  // France TV
  action('append', { id: 'ufo_com', orgId: 'ufo', percent: 0.1, previous: 'rnpp' }),


  // ROW
  action('appendHorizontal', { id: 'row_author', blameId: 'realistism', previous: 'rnpp', children: [
    { type: 'right', id: 'row_all_except_tv_author', orgId: 'author', percent: 0.005, conditions: and([
      condition('orgTurnover', { orgId: 'author', operator: '>=', target: 11_000 }),
      condition('terms', { type: 'medias', operator: 'not-in', list: ['tv'] }),
    ])},
    { type: 'right', id: 'row_tv_author', orgId: 'author', percent: 0.01, conditions: and([
      condition('orgTurnover', { orgId: 'author', operator: '>=', target: 11_000 }),
      condition('terms', { type: 'medias', operator: 'in', list: ['tv'] }),
      condition('terms', { type: 'territories', operator: 'not-in', list: ['france', 'germany'] }),
      // TODO: add not-in sacd dynamic terms -> Update Right
    ])}
  ]}),
  action('append', { id: 'mg_elledriver', orgId: 'elledriver', percent: 1, previous: 'row_author', conditions: and([
    condition('rightRevenu', { rightId: 'mg_elledriver', operator: '<', target: 31_700 })
  ]) }),
  action('append', { id: 'expense_elledriver', orgId: 'elledriver', percent: 1, previous: 'mg_elledriver', conditions: and([
    condition('rightRevenu', { rightId: 'expense_elledriver', operator: '<', target: 51_000 })
  ]) }),
  action('append', { id: 'com_elledriver', orgId: 'elledriver', percent: 0.25, pools: ['income_seller'], previous: 'expense_elledriver' }),
  action('append', { id: 'festival_elledriver', orgId: 'elledriver', percent: 1, pools: ['income_seller'], previous: 'expense_elledriver' }),


  action('append', { id: 'fr_vod', orgId: 'x', previous: 'vod_rd', percent: 0 }),
  action('append', { id: 'fr_svod', orgId: 'x', previous: 'svod_rd', percent: 0 }),
  action('append', { id: 'fr_collectior', orgId: 'x', previous: 'collector_rd', percent: 0 }),
  action('append', { id: 'fr_rent', orgId: 'x', previous: 'rent_rd', percent: 0 }),
  action('append', { id: 'fr_sell', orgId: 'x', previous: 'sell_rd', percent: 0 }),
  action('append', { id: 'fr_tv', orgId: 'x', previous: 'ufo_com', percent: 0 }),
  action('append', { id: 'row_all', orgId: 'x', previous: 'ufo_com', percent: 0 }),
  
  // CNC support
  action('income', { id: 'cnc_support', contractId: 'cnc_support<->rnpp', amount: 31_992, from: 'cnc', to: 'cnc_support', territories: ['france'], medias: [] }),
  
  // Salle FR
  action('income', { id: 'salle_france', amount: 115_969, from: 'cine_theater', to: 'com_cine_commercial_ufo', territories: ['france'], medias: ['salle']}),
  
  // video FR
  action('emitEvent', { eventId: 'fr_dvd_sold', value: 4_000 }),
  action('income', { id: 'dvd_1', amount: 6_650, from: 'fr_sell', to: 'sell_rd', territories: ['france'], medias: ['dvd']}),
  action('emitEvent', { eventId: 'fr_dvd_sold', value: 4_344 }),
  action('income', { id: 'dvd_2', amount: 22_433, from: 'fr_sell', to: 'sell_rd', territories: ['france'], medias: ['dvd']}),
  action('income', { id: 'collector', amount: 24_125, from: 'fr_collectior', to: 'collector_rd', territories: ['france'], medias: ['dvd']}),
  action('income', { id: 'rent', amount: 5_290, from: 'fr_rent', to: 'rent_rd', territories: ['france'], medias: ['dvd']}),
  action('income', { id: 'svod', amount: 2_000, from: 'fr_svod', to: 'svod_rd', territories: ['france'], medias: ['svod']}),
  action('income', { id: 'vod', amount: 3_948, from: 'fr_vod', to: 'vod_rd', territories: ['france'], medias: ['tvod']}),
  
  // TV FR
  action('income', { id: 'tv', amount: 10_000, from: 'fr_tv', to: 'ufo_com', territories: ['france'], medias: ['tv']}),
  // ROW
  action('income', { id: 'export', amount: 380_739, from: 'row_all', to: 'com_elledriver', territories: ['row'], medias: ['vod', 'tv', 'salle', 'svod', 'dvd']}),

  // Update right

];