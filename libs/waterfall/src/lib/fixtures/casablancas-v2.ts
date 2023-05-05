import { and, condition, Action, action } from '@blockframes/model';

const contracts: Action[] = [
  // --------- BLOCK 09/03/16 --------- 
  action('contract', { id: 'fr_cine', amount: 0, date: new Date('2016/03/09') }),
  action('contract', { id: 'fr_dvd', amount: 0, date: new Date('2016/03/09') }),
  action('contract', { id: 'fr_vod', amount: 0, date: new Date('2016/03/09') }),

  // --------- BLOCK 30/06/16 --------- 
  //madman_au	Creation	Playtime	Madman	30/06/16	30/06/16	30/06/26	Mandate	Australia	All	30_000	$
  action('contract', { id: 'madman_au', amount: 30_000, date: new Date('2016/06/30'), start: new Date('2016/06/30'), end: new Date('2026/06/30') }),
  //telepool_ger	Creation	Playtime	Telepool	30/06/16	30/06/16	30/06/26	Mandate	Germany	All	50_000	€
  action('contract', { id: 'telepool_ger', amount: 50_000, date: new Date('2016/06/30'), start: new Date('2016/06/30'), end: new Date('2026/06/30') }),
  // netflix_world	Creation	Playtime	Netflix	30/06/16	30/06/16	29/06/21	Sale	World excl France	SVOD	300_000	€
  action('contract', { id: 'netflix_world', amount: 300_000, date: new Date('2016/06/30'), start: new Date('2016/06/30'), end: new Date('2021/06/29') }),

  // --------- BLOCK 31/12/16 --------- 
  // netflix_world	Delete (update?)			31/12/16	
  action('updateContract', { id: 'netflix_world', date: new Date('2016/12/31'), end: new Date('2016/12/30') }),
  //netflix_us	Creation	Playtime	Netflix	31/12/16	31/12/16	30/12/21	Sale	USA, Canada	SVOD	150_000	€
  action('contract', { id: 'netflix_us', amount: 150_000, date: new Date('2016/12/31'), start: new Date('2016/12/31'), end: new Date('2021/12/30') }),
  //netflix_row	Creation	Playtime	Netflix	31/12/16	31/12/16	30/12/21	Sale	World excl FR, USA, CAN	SVOD	150_000	€
  action('contract', { id: 'netflix_row', amount: 150_000, date: new Date('2016/12/31'), start: new Date('2016/12/31'), end: new Date('2021/12/30') }),
  //festivals	Creation	Playtime		31/12/16	31/12/16	31/12/17	Sale	World	Festivals	1_900	€
  action('contract', { id: 'festivals', amount: 1_900, date: new Date('2016/12/31'), start: new Date('2016/12/31'), end: new Date('2017/12/31') }),
  //ocs_fr_tv	Creation	Playtime	OCS	31/12/16	31/12/16	31/12/18	Sale	France	TV	30_000	€
  action('contract', { id: 'ocs_fr_tv', amount: 30_000, date: new Date('2016/12/31'), start: new Date('2016/12/31'), end: new Date('2028/12/31') }),

  // --------- BLOCK 28/02/17 --------- 
  //encore_inflight_world	Creation	Playtime	Encore Inflight	28/02/17	28/02/17	28/02/27	Mandate	World	Airlines	0	€
  action('contract', { id: 'encore_inflight_world', amount: 0, date: new Date('2017/02/28') }),
  //first_run_us	Creation	Playtime	First Run	28/02/17	28/02/17	28/02/27	Mandate	USA	Theatrical, Video	0	$
  action('contract', { id: 'first_run_us', amount: 0, date: new Date('2017/02/28'), start: new Date('2017/02/28'), end: new Date('2027/02/28') }),
  //ocs_fr_tv	Update	Playtime	OCS	28/02/17						-15_000	€
  action('updateContract', { id: 'ocs_fr_tv', amount: 15_000, date: new Date('2017/02/28') }),

  // --------- BLOCK 30/04/17 --------- 
  //netflix_us	Update	Playtime	Netflix	30/04/17						15_000	€
  action('updateContract', { id: 'netflix_us', amount: 165_000, date: new Date('2017/04/30') }),
  //netflix_row	Update	Playtime	Netflix	30/04/17						-15_000	€
  action('contract', { id: 'netflix_row', amount: 135_000, date: new Date('2017/04/30') }),
];

const sellers: Action[] = [
  // com Playtime
  action('append', { id: 'playtime_com_festival', orgId: 'playtime', previous: 'playtime_row_1_expense', percent: 0.5 }),
  action('append', { id: 'playtime_row_com_all', orgId: 'playtime', previous: 'playtime_row_1_expense', percent: 0.25 }),
  action('append', { id: 'playtime_us_com_all', orgId: 'playtime', previous: 'playtime_row_1_expense', percent: 0.25 }),

  action('appendVertical', {
    id: 'playtime_fr_com_tv',
    previous: 'playtime_fr_expense',
    children: [
      {
        type: 'right', id: 'playtime_fr_com_tv_0', orgId: 'playtime', percent: 0.15, conditions: and([
          condition('contractAmount', { operator: '<', target: 50_000 })
        ])
      },
      {
        type: 'right', id: 'playtime_fr_com_tv_1', orgId: 'playtime', percent: 0.10, conditions: and([
          condition('contractAmount', { operator: '>=', target: 50_000 })
        ])
      },
    ]
  }),

  action('append', { id: 'playtime_fr_com_svod', orgId: 'playtime', previous: 'playtime_fr_expense', percent: 0.25 }),

  action('appendHorizontal', {
    id: 'us_svod_com',
    blameId: 'realitism',
    previous: ['playtime_row_1_expense'],
    children: [
      { type: 'right', id: 'playtime_us_com_svod', orgId: 'playtime', percent: 0.1 },
      {
        type: 'vertical', id: 'rf_corridor_a', children: [
          {
            type: 'right', id: 'soficinema_corridor_share_a', orgId: 'playtime', percent: 0.15, conditions: and([
              condition('incomeDate', { to: new Date('2017/12/31') })
            ])
          },
          { type: 'right', id: 'rf_corridor_share_a', orgId: 'realitism', percent: 0.15 }
        ]
      }
    ]
  }),

  action('appendHorizontal', {
    id: 'row_svod_com',
    blameId: 'realitism',
    previous: ['playtime_row_1_expense'],
    children: [
      { type: 'right', id: 'playtime_row_com_svod', orgId: 'playtime', percent: 0.15 },
      {
        type: 'vertical', id: 'rf_corridor_b', children: [
          {
            type: 'right', id: 'soficinema_corridor_share_b', orgId: 'playtime', percent: 0.10, conditions: and([
              condition('incomeDate', { to: new Date('2017/12/31') })
            ])
          },
          { type: 'right', id: 'rf_corridor_share_b', orgId: 'realitism', percent: 0.10 }
        ]
      }
    ]
  }),

  // playtime_cross_group
  action('append', {
    id: 'playtime_row_1_expense', orgId: 'playtime', previous: 'playtime_row_2_expense', percent: 1, conditions: and([
      condition('rightRevenu', { rightId: 'playtime_row_1_expense', operator: '<', target: { id: 'expense_us', 'in': 'expense', 'percent': 1 } }),
      condition('contractDate', { from: new Date('2017/02/28') })
    ])
  }),
  action('append', {
    id: 'playtime_row_2_expense', orgId: 'playtime', previous: 'playtime_row_mg', percent: 1, conditions: and([
      condition('rightRevenu', { rightId: 'playtime_row_2_expense', operator: '<', target: { id: 'expense_row', 'in': 'expense', 'percent': 1 } }),
    ])
  }),
  action('append', {
    id: 'playtime_fr_expense', orgId: 'playtime', previous: 'playtime_row_1_expense', percent: 1, conditions: and([
      condition('rightRevenu', { rightId: 'playtime_fr_expense', operator: '<', target: { id: 'expense_fr_tv', 'in': 'expense', 'percent': 1 } }),
    ])
  }),


  action('appendVertical', {
    id: 'playtime_row_mg',
    previous: ['playtime_compensation_corridor_us_svod'],
    children: [
      {
        type: 'right', id: 'playtime_row_mg_fr_tv', orgId: 'playtime', percent: 0.15, pools: ['playtime_row_mg', 'amortization'], conditions: and([
          condition('poolRevenu', { pool: 'playtime_row_mg', operator: '<', target: 50_000 }),
          condition('terms', { type: 'territory', operator: 'in', list: ['fr'] }),
          condition('terms', { type: 'media', operator: 'in', list: ['tv'] }),
        ])
      },
      {
        type: 'right', id: 'playtime_row_mg_fr_svod', orgId: 'playtime', percent: 0.5, pools: ['playtime_row_mg', 'amortization'], conditions: and([
          condition('poolRevenu', { pool: 'playtime_row_mg', operator: '<', target: 50_000 }),
          condition('terms', { type: 'territory', operator: 'in', list: ['fr'] }),
          condition('terms', { type: 'media', operator: 'in', list: ['svod'] }),
        ])
      },
      {
        type: 'right', id: 'playtime_row_mg_festival', orgId: 'playtime', percent: 1, pools: ['playtime_row_mg', 'amortization'], conditions: and([
          condition('poolRevenu', { pool: 'playtime_row_mg', operator: '<', target: 50_000 }),
          condition('terms', { type: 'media', operator: 'in', list: ['festival'] }),
        ])
      },
      {
        type: 'right', id: 'playtime_row_mg_us', orgId: 'playtime', percent: 0.1, pools: ['playtime_row_mg', 'amortization'], conditions: and([
          condition('poolRevenu', { pool: 'playtime_row_mg', operator: '<', target: 50_000 }),
          condition('terms', { type: 'territory', operator: 'in', list: ['us', 'can'] }),
        ])
      },
      {
        type: 'right', id: 'playtime_row_mg_row', orgId: 'playtime', percent: 0.7, pools: ['playtime_row_mg', 'amortization'], conditions: and([
          condition('poolRevenu', { pool: 'playtime_row_mg', operator: '<', target: 50_000 }),
          condition('terms', { type: 'territory', operator: 'not-in', list: ['us', 'can', 'fr'] }),
        ])
      },
    ]
  }),

  action('append', {
    id: 'playtime_compensation_corridor_us_svod', orgId: 'playtime', previous: 'playtime_compensation_corridor_row_svod', percent: 100, conditions: and([
      condition('rightRevenu', { rightId: 'playtime_compensation_corridor_us_svod', operator: '<', target: { id: 'us_svod_com', in: 'rights.turnover', percent: 0.15 } }),
      condition('contract', { operator: 'not-in', contractIds: ['netflix_us', 'netflix_row'] }),
    ])
  }),
  action('append', {
    id: 'playtime_compensation_corridor_row_svod', orgId: 'playtime', previous: [], percent: 100, conditions: and([
      condition('rightRevenu', { rightId: 'playtime_compensation_corridor_row_svod', operator: '<', target: { id: 'row_svod_com', in: 'rights.turnover', percent: 0.1 } }),
      condition('contract', { operator: 'not-in', contractIds: ['netflix_us', 'netflix_row'] }),
    ])
  }),

  // com UFO
  action('append', { id: 'ufo_fr_com_cine', orgId: 'ufo', previous: 'ufo_fr_expense', percent: 0.25 }),
  action('append', { id: 'ufo_fr_com_dvd', orgId: 'ufo', previous: 'ufo_fr_expense', percent: 0.75 }),
  action('append', { id: 'ufo_fr_com_vod', orgId: 'ufo', previous: 'ufo_fr_expense', percent: 0.35 }),

  action('append', {
    id: 'ufo_fr_expense', orgId: 'ufo', previous: 'ufo_fr_mg', percent: 1, conditions: and([
      condition('rightRevenu', { rightId: 'ufo_fr_expense', operator: '<', target: { id: 'expense_fr', 'in': 'expense', 'percent': 1 } }),
    ])
  }),

  action('append', {
    id: 'ufo_fr_mg', orgId: 'ufo', previous: [], percent: 1, pools: ['amortization'], conditions: and([
      condition('rightRevenu', { rightId: 'ufo_fr_mg', operator: '<', target: 30_000 }),
    ])
  }),
];

const rnpp: Action[] = [

  action('prependHorizontal', {
    blameId: 'playtime',
    id: 'rnpp',
    next: ['ufo_fr_mg', 'playtime_compensation_corridor_row_svod'],
    children: [
      {
        type: 'right', id: 'soficinema_rnpp_fr_cine', orgId: 'soficinema', percent: 0.3, conditions: and([
          condition('orgRevenu', { orgId: 'soficinema', operator: '<', target: 115_000 }),
          condition('terms', { type: 'territory', operator: 'in', list: ['fr'] }),
          condition('terms', { type: 'media', operator: 'in', list: ['salles'] }),
        ])
      },
      {
        type: 'right', id: 'soficinema_rnpp_fr_video', orgId: 'soficinema', percent: 0.5, conditions: and([
          condition('orgRevenu', { orgId: 'soficinema', operator: '<', target: 115_000 }),
          condition('terms', { type: 'territory', operator: 'in', list: ['fr'] }),
          condition('terms', { type: 'media', operator: 'in', list: ['dvd', 'vod', 'svod'] }),
        ])
      },
      {
        type: 'right', id: 'soficinema_rnpp_fr_tv', orgId: 'soficinema', percent: 0.85, conditions: and([
          condition('orgRevenu', { orgId: 'soficinema', operator: '<', target: 115_000 }),
          condition('terms', { type: 'territory', operator: 'in', list: ['fr'] }),
          condition('terms', { type: 'media', operator: 'in', list: ['tv'] }),
        ])
      },
      {
        type: 'right', id: 'soficinema_rnpp_us', orgId: 'soficinema', percent: 1, conditions: and([
          condition('orgRevenu', { orgId: 'soficinema', operator: '<', target: 115_000 }),
          condition('terms', { type: 'territory', operator: 'in', list: ['us', 'can'] }),
        ])
      },
      {
        type: 'vertical', id: 'soficinema_rnpp_row', children: [
          {
            type: 'right', id: 'soficinema_rnpp_row_1', orgId: 'soficinema', percent: 1, conditions: and([
              condition('orgRevenu', { orgId: 'soficinema', operator: '<', target: 115_000 }),
              condition('poolRevenu', { pool: 'playtime_row_mg', operator: '<', target: 50_000 }),
              condition('terms', { type: 'territory', operator: 'not-in', list: ['us', 'can', 'fr'] }),
            ])
          },
          {
            type: 'right', id: 'soficinema_rnpp_row_2', orgId: 'soficinema', percent: 0.8, conditions: and([
              condition('orgRevenu', { orgId: 'soficinema', operator: '<', target: 115_000 }),
              condition('terms', { type: 'territory', operator: 'not-in', list: ['us', 'can', 'fr'] }),
            ])
          }
        ]
      },
      {
        type: 'right', id: 'soficinema_rnpp_festival', orgId: 'soficinema', percent: 0.3, conditions: and([
          condition('orgRevenu', { orgId: 'soficinema', operator: '<', target: 115_000 }),
          condition('terms', { type: 'media', operator: 'in', list: ['festival'] }),
        ])
      },
      {
        type: 'right', id: 'casablancas_rnpp', orgId: 'casablancas', percent: 0.33, conditions: and([
          condition('poolTurnover', { pool: 'amortization', operator: '>=', target: 526_849 })
        ])
      },
      {
        type: 'right', id: 'maneki_rnpp', orgId: 'maneki', percent: 0.1, conditions: and([
          condition('orgRevenu', { orgId: 'maneki', operator: '>=', target: 30_655 })
        ])
      }
    ]
  }),
  action('prepend', {
    id: 'soficinema_rnpp2', next: 'rnpp', orgId: 'soficinema', percent: 0.1, conditions: and([
      condition('orgRevenu', { orgId: 'soficinema', operator: '>=', target: 115_000 }),
      condition('orgRevenu', { orgId: 'soficinema', operator: '<', target: 165_000 })
    ])
  }),
  action('prepend', {
    id: 'soficinema_rnpp3', next: 'soficinema_rnpp2', orgId: 'soficinema', percent: 0.04, conditions: and([
      condition('orgRevenu', { orgId: 'soficinema', operator: '>=', target: 165_000 })
    ])
  }),
];

const residuals: Action[] = [
  action('prependHorizontal', {
    blameId: 'playtime',
    id: 'residuals',
    next: ['soficinema_rnpp3'],
    children: [
      {
        type: 'vertical', id: 'jb_residuals_a', pools: ['rf_residuals_share'], percent: 0.372, children: [
          {
            type: 'right', id: 'jb_residuals_a_1', orgId: 'jb', percent: 0.08, conditions: and([
              condition('poolRevenu', { pool: 'rf_residuals_share', operator: '<', target: 53_700 }),
              condition('orgRevenu', { orgId: 'jb', operator: '<', target: 8_000 })
            ])
          },
          {
            type: 'right', id: 'jb_residuals_a_2', orgId: 'jb', percent: 0.016, conditions: and([
              condition('poolRevenu', { pool: 'rf_residuals_share', operator: '<', target: 53_700 }),
              condition('orgRevenu', { orgId: 'jb', operator: '<', target: 16_000 })
            ])
          },
          {
            type: 'right', id: 'jb_residuals_a_3', orgId: 'jb', percent: 0.004, conditions: and([
              condition('poolRevenu', { pool: 'rf_residuals_share', operator: '<', target: 53_700 }),
            ])
          }
        ]
      },
      {
        type: 'vertical', id: 'sl_residuals_a', pools: ['rf_residuals_share'], percent: 0.372, children: [
          {
            type: 'right', id: 'sl_residuals_a_1', orgId: 'sl', percent: 0.1, conditions: and([
              condition('poolRevenu', { pool: 'rf_residuals_share', operator: '<', target: 53_700 }),
              condition('orgRevenu', { orgId: 'sl', operator: '<', target: 10_000 })
            ])
          },
          {
            type: 'right', id: 'sl_residuals_a_2', orgId: 'sl', percent: 0.02, conditions: and([
              condition('poolRevenu', { pool: 'rf_residuals_share', operator: '<', target: 53_700 }),
              condition('orgRevenu', { orgId: 'sl', operator: '<', target: 20_000 })
            ])
          },
          {
            type: 'right', id: 'sl_residuals_a_3', orgId: 'sl', percent: 0.005, conditions: and([
              condition('poolRevenu', { pool: 'rf_residuals_share', operator: '<', target: 53_700 }),
            ])
          }
        ]
      },
      {
        type: 'vertical', id: 'rf_residuals', percent: 0.372, children: [
          {
            type: 'right', id: 'rf_residuals_1', orgId: 'realitism', percent: 0.82, conditions: and([
              condition('poolRevenu', { pool: 'rf_residuals_share', operator: '<', target: 53_700 }),
              condition('orgRevenu', { orgId: 'jb', operator: '<', target: 8_000 }),
              condition('orgRevenu', { orgId: 'sl', operator: '<', target: 10_000 })
            ])
          },
          {
            type: 'right', id: 'rf_residuals_2', orgId: 'realitism', percent: 0.964, conditions: and([
              condition('poolRevenu', { pool: 'rf_residuals_share', operator: '<', target: 53_700 }),
              condition('orgRevenu', { orgId: 'jb', operator: '<', target: 16_000 }),
              condition('orgRevenu', { orgId: 'sl', operator: '<', target: 20_000 })
            ])
          },
          {
            type: 'right', id: 'rf_residuals_3', orgId: 'realitism', percent: 0.991, conditions: and([
              condition('poolRevenu', { pool: 'rf_residuals_share', operator: '<', target: 53_700 }),
            ])
          }
        ]
      },
      {
        type: 'right', id: 'pf_residuals', orgId: 'picture_farm', percent: 0.2771, conditions: and([
          condition('orgRevenu', { orgId: 'picture_farm', operator: '<', target: 40_000 }),
        ])
      },
      {
        type: 'right', id: 'maneki_residuals', orgId: 'maneki', percent: 0.2124, conditions: and([
          condition('orgRevenu', { orgId: 'maneki', operator: '<', target: 30_655 }),
        ])
      },
      {
        type: 'right', id: 'hubert_residuals', orgId: 'hubert', percent: 0.1385, conditions: and([
          condition('orgRevenu', { orgId: 'hubert', operator: '<', target: 20_000 }),
        ])
      },
    ]
  }),
  action('prependHorizontal', {
    blameId: 'playtime',
    id: 'jb_sl_residuals',
    next: ['residuals'],
    children: [
      {
        type: 'vertical', id: 'jb_residuals_b', pools: ['rf_residuals_share'], children: [
          {
            type: 'right', id: 'jb_residuals_b_1', orgId: 'jb', percent: 0.08, conditions: and([
              condition('orgRevenu', { orgId: 'jb', operator: '<', target: 8_000 })
            ])
          },
          {
            type: 'right', id: 'jb_residuals_b_2', orgId: 'jb', percent: 0.016, conditions: and([
              condition('orgRevenu', { orgId: 'jb', operator: '<', target: 16_000 })
            ])
          },
          { type: 'right', id: 'jb_residuals_b_3', orgId: 'jb', percent: 0.004 }
        ]
      },
      {
        type: 'vertical', id: 'sl_residuals_b', pools: ['rf_residuals_share'], children: [
          {
            type: 'right', id: 'sl_residuals_b_1', orgId: 'sl', percent: 0.1, conditions: and([
              condition('orgRevenu', { orgId: 'sl', operator: '<', target: 10_000 })
            ])
          },
          {
            type: 'right', id: 'sl_residuals_b_2', orgId: 'sl', percent: 0.02, conditions: and([
              condition('orgRevenu', { orgId: 'sl', operator: '<', target: 20_000 })
            ])
          },
          { type: 'right', id: 'sl_residuals_b_3', orgId: 'sl', percent: 0.005 }
        ]
      }
    ]
  }),
  action('prepend', { id: 'rf_rest', next: 'jb_sl_residuals', orgId: 'realitism', percent: 1 }),
]

const expensesAndIncomes: Action[] = [
  // --------- BLOCK 09/03/16 --------- 
  // 09/03/16	UFO	88_500 €	expense_fr	cine
  action('expense', { orgId: 'ufo', type: 'expense_fr', amount: 88_500, date: new Date('2016/03/09') }),
  // 09/03/16	fr_cine	fr_cine_1	fr_cine	6_919 €
  action('income', { id: 'fr_cine_1', contractId: 'fr_cine', date: new Date('2016/03/09'), from: 'fr_cine', to: 'ufo_fr_com_cine', territory: ['fr'], media: ['salle'], amount: 6_919 }),
  // 09/03/16	fr_dvd	fr_dvd_1	fr_dvd	0 €
  action('income', { id: 'fr_dvd_1', contractId: 'fr_dvd', date: new Date('2016/03/09'), from: 'fr_dvd', to: 'ufo_fr_com_dvd', territory: ['fr'], media: ['dvd'], amount: 0 }),
  // 09/03/16	fr_vod	fr_vod_1	fr_vod	0 €
  action('income', { id: 'fr_vod_1', contractId: 'fr_vod', date: new Date('2016/03/09'), from: 'fr_vod', to: 'ufo_fr_com_vod', territory: ['fr'], media: ['vod'], amount: 0 }),

  // --------- BLOCK 30/06/16 --------- 
  // 30/06/16	Playtime	10_828 €	expense_row	distrib
  action('expense', { orgId: 'playtime', type: 'expense_row', amount: 10_828, date: new Date('2016/06/30') }),
  // 30/06/16	Playtime	74 €	expense_row	cnc
  action('expense', { orgId: 'playtime', type: 'expense_row', amount: 74, date: new Date('2016/06/30') }),
  // 30/06/16	Playtime	10_200 €	expense_row	market
  action('expense', { orgId: 'playtime', type: 'expense_row', amount: 10_200, date: new Date('2016/06/30') }),

  // --------- BLOCK 31/12/16 --------- 
  // 31/12/16	Playtime	7 €	expense_row	cnc
  action('expense', { orgId: 'playtime', type: 'expense_row', amount: 7, date: new Date('2016/12/31') }),
  // 31/12/16	Playtime	17_821 €	expense_row	distrib
  action('expense', { orgId: 'playtime', type: 'expense_row', amount: 17_821, date: new Date('2016/12/31') }),
  // 31/12/16	festivals	festivals_1	festivals	1_200 €
  action('income', { id: 'festivals_1', contractId: 'festivals', date: new Date('2016/12/31'), from: 'festivals', to: 'playtime_com_festival', territory: ['all'], media: ['festival'], amount: 1_200 }),

  // --------- BLOCK 28/02/17 --------- 
  // 28/02/17	Playtime	270 €	expense_row	cnc
  action('expense', { orgId: 'playtime', type: 'expense_row', amount: 270, date: new Date('2017/02/28') }),
  // 28/02/17	Playtime	2_554 €	expense_row	distrib
  action('expense', { orgId: 'playtime', type: 'expense_row', amount: 2_554, date: new Date('2017/02/28') }),
  // 28/02/17	madman_au	madman_1	row_all	26_077 €
  action('income', { id: 'madman_1', contractId: 'madman_au', date: new Date('2017/02/28'), from: 'row_all', to: 'playtime_row_com_all', territory: ['row'], media: ['all'], amount: 26_077 }),
  // 28/02/17	netflix_us	netflix_us_1	us_svod	11_509 €
  action('income', { id: 'netflix_us_1', contractId: 'netflix_us', date: new Date('2017/02/28'), from: 'us_svod', to: 'us_svod_com', territory: ['us', 'can'], media: ['svod'], amount: 11_509 }),
  // 28/02/17	netflix_row	netflix_row_1	row_svod	11_509 €
  action('income', { id: 'netflix_row_1', contractId: 'netflix_row', date: new Date('2017/02/28'), from: 'row_svod', to: 'row_svod_com', territory: ['row'], media: ['svod'], amount: 11_509 }),

  // --------- BLOCK 30/04/17 --------- 
  // 30/04/17	Playtime	-4_314 €	expense_row	distrib
  action('expense', { orgId: 'playtime', type: 'expense_row', amount: -4_314, date: new Date('2017/04/30') }),
  // 30/04/17	Playtime	6_065 €	expense_fr_tv	
  action('expense', { orgId: 'playtime', type: 'expense_fr_tv', amount: 6_065, date: new Date('2017/04/30') }),
  // 30/04/17	Playtime	7_500 €	expense_us	
  action('expense', { orgId: 'playtime', type: 'expense_us', amount: 7_500, date: new Date('2017/04/30') }),
  // 30/04/17	netflix_us	netflix_us_2	us_svod	12_893 €
  action('income', { id: 'netflix_us_2', contractId: 'netflix_us', date: new Date('2017/04/30'), from: 'us_svod', to: 'us_svod_com', territory: ['us', 'can'], media: ['svod'], amount: 12_893 }),
  // 30/04/17	netflix_row	netflix_row_2	row_svod	10_549 €
  action('income', { id: 'netflix_row_2', contractId: 'netflix_row', date: new Date('2017/04/30'), from: 'row_svod', to: 'row_svod_com', territory: ['row'], media: ['svod'], amount: 10_549 }),

  // --------- BLOCK 15/06/17 --------- 
  // 15/06/17	fr_cine	fr_cine_2	fr_cine	249 €
  action('income', { id: 'fr_cine_2', contractId: 'fr_cine', date: new Date('2017/06/15'), from: 'fr_cine', to: 'ufo_fr_com_cine', territory: ['fr'], media: ['salle'], amount: 249 }),
  // 15/06/17	fr_dvd	fr_dvd_2	fr_dvd	1_030 €
  action('income', { id: 'fr_dvd_2', contractId: 'fr_dvd', date: new Date('2017/06/15'), from: 'fr_dvd', to: 'ufo_fr_com_dvd', territory: ['fr'], media: ['dvd'], amount: 1_030 }),
  // 15/06/17	fr_vod	fr_vod_2	fr_vod	3_117 €
  action('income', { id: 'fr_vod_2', contractId: 'fr_vod', date: new Date('2017/06/15'), from: 'fr_vod', to: 'ufo_fr_com_vod', territory: ['fr'], media: ['vod'], amount: 3_117 }),

  // --------- BLOCK 31/10/17 --------- 
  // 31/10/17	Playtime	404 €	expense_row	cnc
  action('expense', { orgId: 'playtime', type: 'expense_row', amount: 404, date: new Date('2017/10/31') }),
  // 31/10/17	Playtime	96 €	expense_row	distrib
  action('expense', { orgId: 'playtime', type: 'expense_row', amount: 96, date: new Date('2017/10/31') }),
  // 31/10/17	telepool_ger	telepool_1	row_all	50_000 €
  action('income', { id: 'telepool_1', contractId: 'telepool_ger', date: new Date('2017/10/31'), from: 'row_all', to: 'playtime_row_com_all', territory: ['row'], media: ['all'], amount: 50_000 }),
  // 31/10/17	netflix_us	netflix_us_3	us_svod	23_453 €
  action('income', { id: 'netflix_us_3', contractId: 'netflix_us', date: new Date('2017/10/31'), from: 'us_svod', to: 'us_svod_com', territory: ['us', 'can'], media: ['svod'], amount: 23_453 }),
  // 31/10/17	netflix_row	netflix_row_3	row_svod	19_189 €
  action('income', { id: 'netflix_row_3', contractId: 'netflix_row', date: new Date('2017/10/31'), from: 'row_svod', to: 'row_svod_com', territory: ['row'], media: ['svod'], amount: 19_189 }),
  // 31/10/17	ocs_fr_tv	ocs_1	fr_tv	15_000 €
  action('income', { id: 'ocs_1', contractId: 'ocs_fr_tv', date: new Date('2017/10/31'), from: 'fr_tv', to: 'playtime_fr_com_tv', territory: ['fr'], media: ['tv'], amount: 15_000 }),

  // --------- BLOCK 31/07/18 --------- 
  // 31/7/18	Playtime	257 €	expense_row	cnc
  action('expense', { orgId: 'playtime', type: 'expense_row', amount: 257, date: new Date('2018/07/31') }),
  // 31/7/18	Playtime	84 €	expense_row	distrib
  action('expense', { orgId: 'playtime', type: 'expense_row', amount: 84, date: new Date('2018/07/31') }),
  // 31/07/18	netflix_us	netflix_us_4	us_svod	34_245 €
  action('income', { id: 'netflix_us_4', contractId: 'netflix_us', date: new Date('2018/07/31'), from: 'us_svod', to: 'us_svod_com', territory: ['us', 'can'], media: ['svod'], amount: 34_245 }),
  // 31/07/18	netflix_row	netflix_row_4	row_svod	28_018 €
  action('income', { id: 'netflix_row_4', contractId: 'netflix_row', date: new Date('2018/07/31'), from: 'row_svod', to: 'row_svod_com', territory: ['row'], media: ['svod'], amount: 28_018 }),

  // --------- BLOCK 31/10/18 --------- 
  // 31/10/18	Playtime	88 €	expense_row	cnc
  action('expense', { orgId: 'playtime', type: 'expense_row', amount: 88, date: new Date('2018/10/31') }),
  // 31/10/18	Playtime	28 €	expense_row	distrib
  action('expense', { orgId: 'playtime', type: 'expense_row', amount: 28, date: new Date('2018/10/31') }),
  // 31/10/18	netflix_us	netflix_us_5	us_svod	11_777 €
  action('income', { id: 'netflix_us_5', contractId: 'netflix_us', date: new Date('2018/10/31'), from: 'us_svod', to: 'us_svod_com', territory: ['us', 'can'], media: ['svod'], amount: 11_777 }),
  // 31/10/18	netflix_row	netflix_row_5	row_svod	9_636 €
  action('income', { id: 'netflix_row_5', contractId: 'netflix_row', date: new Date('2018/10/31'), from: 'row_svod', to: 'row_svod_com', territory: ['row'], media: ['svod'], amount: 9_636 }),

  // --------- BLOCK 28/02/19 --------- 
  // 28/02/19	Playtime	89 €	expense_row	cnc
  action('expense', { orgId: 'playtime', type: 'expense_row', amount: 89, date: new Date('2019/02/28') }),
  // 28/02/19	Playtime	28 €	expense_row	distrib
  action('expense', { orgId: 'playtime', type: 'expense_row', amount: 28, date: new Date('2019/02/28') }),
  // 28/02/19	first_run_us	first_run_1	us_all	112 €
  action('income', { id: 'first_run_1', contractId: 'first_run_us', date: new Date('2019/02/28'), from: 'us_all', to: 'playtime_us_com_all', territory: ['us'], media: ['all'], amount: 112 }),
  // 28/02/19	netflix_us	netflix_us_6	us_svod	11_808 €
  action('income', { id: 'netflix_us_6', contractId: 'netflix_us', date: new Date('2019/02/28'), from: 'us_svod', to: 'us_svod_com', territory: ['us', 'can'], media: ['svod'], amount: 11_808 }),
  // 28/02/19	netflix_row	netflix_row_6	row_svod	9_661 €
  action('income', { id: 'netflix_row_6', contractId: 'netflix_row', date: new Date('2019/02/28'), from: 'row_svod', to: 'row_svod_com', territory: ['row'], media: ['svod'], amount: 9_661 }),

  // --------- BLOCK 31/05/19 --------- 
  // 31/05/19	Playtime	91 €	expense_row	cnc
  action('expense', { orgId: 'playtime', type: 'expense_row', amount: 91, date: new Date('2019/05/31') }),
  // 31/05/19	Playtime	140 €	expense_row	distrib
  action('expense', { orgId: 'playtime', type: 'expense_row', amount: 140, date: new Date('2019/05/31') }),
  // 31/05/19	netflix_us	netflix_us_7	us_svod	12_131 €
  action('income', { id: 'netflix_us_7', contractId: 'netflix_us', date: new Date('2019/05/31'), from: 'us_svod', to: 'us_svod_com', territory: ['us', 'can'], media: ['svod'], amount: 12_131 }),
  // 31/05/19	netflix_row	netflix_row_7	row_svod	9_925 €
  action('income', { id: 'netflix_row_7', contractId: 'netflix_row', date: new Date('2019/05/31'), from: 'row_svod', to: 'row_svod_com', territory: ['row'], media: ['svod'], amount: 9_925 }),

  // --------- BLOCK 31/10/19 ---------
  // 31/10/19	Playtime	183 €	expense_row	cnc
  action('expense', { orgId: 'playtime', type: 'expense_row', amount: 183, date: new Date('2019/10/31') }),
  // 31/10/19	Playtime	56 €	expense_row	distrib
  action('expense', { orgId: 'playtime', type: 'expense_row', amount: 56, date: new Date('2019/10/31') }),
  // 31/10/19	netflix_us	netflix_us_8	us_svod	24_465 €
  action('income', { id: 'netflix_us_8', contractId: 'netflix_us', date: new Date('2019/10/31'), from: 'us_svod', to: 'us_svod_com', territory: ['us', 'can'], media: ['svod'], amount: 24_465 }),
  // 31/10/19	netflix_row	netflix_row_8	row_svod	20_017 €
  action('income', { id: 'netflix_row_8', contractId: 'netflix_row', date: new Date('2019/10/31'), from: 'row_svod', to: 'row_svod_com', territory: ['row'], media: ['svod'], amount: 208017 }),

];

export const actions: Action[] = [...contracts, ...sellers, ...rnpp, ...residuals, ...expensesAndIncomes];