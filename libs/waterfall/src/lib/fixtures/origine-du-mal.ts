import { and, condition, Action, action } from '@blockframes/model';

export const actions: Action[] = [
  /////////
  // ROW //
  /////////

  // row_all
  action('prepend',  { id: 'row_all', orgId: 'x', next: [], percent: 0 }),
  action('prependHorizontal', {
    id: 'row_all_shared',
    blameId: 'charades',
    next: 'row_all',
    children: [
      { type: 'vertical', id: 'charades_row_com_all', children: [
        { type: 'right', id: 'charades_row_com_all_1', orgId: 'charades', percent: 0.1875, conditions: and([
          condition('poolRevenu', { pool: 'row_mg_group', operator: '<', target: 150_000 })
        ]) },
        { type: 'right', id: 'charades_row_com_all_2', orgId: 'charades', percent: 0.2 }
      ] },
      { type: 'vertical', id: 'cofinova_row_com_all_share', children: [
        { type: 'right', id: 'cofinova_row_com_all_share_1', orgId: 'cofinova', percent: 0.03125, conditions: and([
          condition('poolRevenu', { pool: 'row_mg_group', operator: '<', target: 150_000 })
        ]) },
        { type: 'right', id: 'cofinova_row_com_all_share_2', orgId: 'cofinova', percent: 0.05 },
      ]},
      { type: 'right', id: 'cineaxe_row_com_all_share', orgId: 'cineaxe', percent: 0.015625, conditions: and([
        condition('orgRevenu', { orgId: 'cineaxe', operator: '<', target: 35_500})
      ]) },
      { type: 'right', id: 'cinecap_row_com_all_share', orgId: 'cinecap', percent: 0.015625, conditions: and([
        condition('orgRevenu', { orgId: 'cinecap', operator: '<', target: 35_500})
      ]) },
    ]
  }),

  // Festival
  action('prepend',  { id: 'festival', orgId: 'x', next: [], percent: 0 }),
  action('prependHorizontal', {
    id: 'festival_shared',
    blameId: 'charades',
    next: 'festival',
    children: [
      { type: 'vertical', id: 'charades_row_com_festival', children: [
        { type: 'right', id: 'charades_row_com_festival_1', orgId: 'charades', percent: 0.1875, conditions: and([
          condition('poolRevenu', { pool: 'row_mg_group', operator: '<', target: 150_000 })
        ]) },
        { type: 'right', id: 'charades_row_com_festival_2', orgId: 'charades', percent: 0.2 }
      ] },
      { type: 'vertical', id: 'cofinova_row_com_festival_share', children: [
        { type: 'right', id: 'cofinova_row_com_festival_share_1', orgId: 'cofinova', percent: 0.0625, conditions: and([
          condition('poolRevenu', { pool: 'row_mg_group', operator: '<', target: 150_000 })
        ]) },
        { type: 'right', id: 'cofinova_row_com_festival_share_2', orgId: 'cofinova', percent: 0.1 },
      ]},
      { type: 'right', id: 'cineaxe_row_com_festival_share', orgId: 'cineaxe', percent: 0.03125, conditions: and([
        condition('orgRevenu', { orgId: 'cineaxe', operator: '<', target: 35_500})
      ]) },
      { type: 'right', id: 'cinecap_row_com_festival_share', orgId: 'cinecap', percent: 0.03125, conditions: and([
        condition('orgRevenu', { orgId: 'cinecap', operator: '<', target: 35_500})
      ]) },
    ]
  }),


  // ROW SVOD
  action('prepend',  { id: 'row_svod', orgId: 'x', next: [], percent: 0 }),
  action('prependHorizontal', {
    id: 'row_svod_shared',
    blameId: 'charades',
    next: 'row_svod',
    children: [
      { type: 'vertical', id: 'charades_row_com_svod', children: [
        { type: 'right', id: 'charades_row_com_svod_1', orgId: 'charades', percent: 0.1875, conditions: and([
          condition('poolRevenu', { pool: 'row_mg_group', operator: '<', target: 150_000 })
        ]) },
        { type: 'right', id: 'charades_row_com_svod_2', orgId: 'charades', percent: 0.2 }
      ] },
      { type: 'vertical', id: 'cofinova_row_com_svod_share', children: [
        { type: 'right', id: 'cofinova_row_com_svod_share_1', orgId: 'cofinova', percent: 0.03125, conditions: and([
          condition('poolRevenu', { pool: 'row_mg_group', operator: '<', target: 150_000 })
        ]) },
        { type: 'right', id: 'cofinova_row_com_svod_share_2', orgId: 'cofinova', percent: 0.04 },
      ]},
      { type: 'right', id: 'cineaxe_row_com_svod_share', orgId: 'cineaxe', percent: 0.015625, conditions: and([
        condition('orgRevenu', { orgId: 'cineaxe', operator: '<', target: 35_500})
      ]) },
      { type: 'right', id: 'cinecap_row_com_svod_share', orgId: 'cinecap', percent: 0.015625, conditions: and([
        condition('orgRevenu', { orgId: 'cinecap', operator: '<', target: 35_500})
      ]) },
    ]
  }),




  action('prependHorizontal', {
    id: 'row_expense_group',
    next: ['row_all_shared', 'festival_shared', 'row_svod_shared'],
    blameId: 'charades',
    children: [
      { type: 'right', id: 'charades_row_expense_share', pools: ['row_expense_group'], orgId: 'charades', percent: 0.625, conditions: and([
        condition('poolRevenu', { pool: 'row_expense_group', operator: '<', target: { id: 'row_expense', in: 'expense', percent: 1 } }),
      ])},
      { type: 'right', id: 'cofinova_row_expense_share', pools: ['row_expense_group'], orgId: 'cofinovoa', percent: 0.375, conditions: and([
        condition('poolRevenu', { pool: 'row_expense_group', operator: '<', target: { id: 'row_expense', in: 'expense', percent: 1 } }),
      ])},
    ] 
  }),

  action('prependHorizontal', {
    id: 'row_mg_group',
    next: 'row_expense_group',
    blameId: 'charades',
    children: [
      { type: 'vertical', id: 'cineaxe_row_mg_share', children: [
        { type: 'right', id: 'cineaxe_row_mg_share_1', orgId: 'cineaxe', pools: ['row_mg_group'], percent: 0.25, conditions: and([
          condition('orgRevenu', { orgId: 'cineaxe', operator: '<', target: 37_500 }),
        ]) },
        { type: 'right', id: 'cineaxe_row_mg_share_2', orgId: 'cineaxe', percent: 0.26, conditions: and([
          condition('poolRevenu', { pool: 'row_mg_group', operator: '<', target: 150_000 }),
        ]) },
        { type: 'right', id: 'cineaxe_row_mg_share_1', orgId: 'cineaxe', percent: 0.05 }
      ] },
      { type: 'vertical', id: 'cinecap_row_mg_share', children: [
        { type: 'right', id: 'cinecap_row_mg_share_1', orgId: 'cinecap', pools: ['row_mg_group'], percent: 0.25, conditions: and([
          condition('orgRevenu', { orgId: 'cinecap', operator: '<', target: 37_500 }),
        ]) },
        { type: 'right', id: 'cinecap_row_mg_share_2', orgId: 'cinecap', percent: 0.26, conditions: and([
          condition('poolRevenu', { pool: 'row_mg_group', operator: '<', target: 150_000 }),
        ]) },
        { type: 'right', id: 'cinecap_row_mg_share_1', orgId: 'cinecap', percent: 0.05 }
      ] },
      { type: 'vertical', id: 'cofinova_row_mg_share', children: [
        { type: 'right', id: 'cofinova_row_mg_share_2', orgId: 'cofinova', percent: 0.5, conditions: and([
          condition('poolRevenu', { pool: 'row_mg_group', operator: '<', target: 150_000 }),
        ]) },
        { type: 'right', id: 'cofinova_row_mg_share_1', orgId: 'cofinova', percent: 0.05 }
      ] },
    ]
  }),

  action('prependHorizontal', {
    id: 'rnpp_row',
    blameId: 'charades',
    next: ['row_mg_group'],
    percent: 0.1469,
    children: [
      { type: 'vertical', id: 'hg_rnpp_row', children: [
        { type: 'right', id: 'hg_rnpp_row_1', orgId: 'hg', percent: 0.0769, conditions: and([
          condition('poolRevenu', { pool: 'jokers_mg_group', operator: '<', target: 60_000 }),
          condition('orgRevenu', { orgId: 'cip', operator: '<', target: 86_307 }),
        ]) },
        { type: 'right', id: 'hg_rnpp_row_2', orgId: 'hg', percent: 0.1538, conditions: and([
          condition('orgRevenu', { orgId: 'hg', operator: '<', target: 64_516 }),
        ]) }
      ] },
      { type: 'vertical', id: 'telefilm_rnpp_row', children: [
        { type: 'right', id: 'telefilm_rnpp_row_1', orgId: 'telefilm', percent: 0.1923, conditions: and([
          condition('poolRevenu', { pool: 'jokers_mg_group', operator: '<', target: 60_000 }),
          condition('orgRevenu', { orgId: 'cip', operator: '<', target: 86_307 }),
        ]) },
        { type: 'right', id: 'telefilm_rnpp_row_2', orgId: 'telefilm', percent: 0.3846, conditions: and([
          condition('orgRevenu', { orgId: 'telefilm', operator: '<', target: 64_516 }),
        ]) }
      ] },
      { type: 'vertical', id: 'sodec_rnpp_row', children: [
        { type: 'right', id: 'sodec_rnpp_row_1', orgId: 'sodec', percent: 0.2308, conditions: and([
          condition('poolRevenu', { pool: 'jokers_mg_group', operator: '<', target: 60_000 }),
          condition('orgRevenu', { orgId: 'cip', operator: '<', target: 86_307 }),
        ]) },
        { type: 'right', id: 'sodec_rnpp_row_2', orgId: 'sodec', percent: 0.4615, conditions: and([
          condition('orgRevenu', { orgId: 'sodec', operator: '<', target: 64_516 }),
        ]) }
      ] },
      { type: 'right', id: 'microscope_rnpp_row', orgId: 'microscope', percent: 0.0023, conditions: and([
        condition('poolRevenu', { pool: 'jokers_mg_group', operator: '<', target: 60_000 }),
      ])},
      { type: 'right', id: 'cip_rnpp_row', orgId: 'cip', percent: 0.4977, conditions: and([
        condition('poolRevenu', { pool: 'jokers_mg_group', operator: '<', target: 60_000 }),
      ])},
      { type: 'right', id: 'cif_rnpp_row', orgId: 'cif', percent: 1, conditions: and([
        condition('orgRevenu', { orgId: 'sodec', operator: '<', target: 64_516 }),
      ])},
    ],
  }),



  ////////////
  // FRANCE //
  ////////////


  // FR CINE
  action('prepend',  { id: 'fr_cine', orgId: 'x', next: [], percent: 0 }),
  action('prepend',  { id: 'jokers_fr_cine_com', orgId: 'jokers', next: 'fr_cine', percent: 0.25 }),


  // FR DVD
  action('prepend',  { id: 'fr_dvd', orgId: 'x', next: [], percent: 0 }),
  action('prepend',  { id: 'jokers_fr_dvd_com', orgId: 'jokers', next: 'fr_dvd', percent: 0.2 }),

  // FR VOD
  action('prepend',  { id: 'fr_vod', orgId: 'x', next: [], percent: 0 }),
  action('prepend',  { id: 'jokers_fr_vod_com', orgId: 'jokers', next: 'fr_vod', percent: 0.2 }),

  // Expense video
  action('prepend',  { id: 'jokers_fr_video_expense', pools: ['jokers_expense_group'], orgId: 'jokers', next: ['jokers_fr_cine_com', 'jokers_fr_dvd_com', 'jokers_fr_vod_com'], percent: 1, conditions: and([
    condition('poolRevenu', { pool: 'jokers_expense_group', operator: '<', target: { id: 'jokers', in: 'orgs.expense', percent: 1 } })
  ]) }),




  // FR TV
  action('prepend',  { id: 'fr_tv', orgId: 'x', next: [], percent: 0 }),
  action('prependHorizontal', {
    id: 'jokers_fr_tv_com',
    next: 'fr_tv',
    blameId: 'jokers',
    children: [
      { type: 'right', id: 'jokers_fr_tv_com_1', orgId: 'jokers', percent: 0.15, conditions: and([
        condition('contractAmount', { operator: '<', target: 50_000 })
      ]) },
      { type: 'right', id: 'jokers_fr_tv_com_2', orgId: 'jokers', percent: 0.1, conditions: and([
        condition('contractAmount', { operator: '>=', target: 50_000 })
      ]) },
    ]
  }),

  // FR SVOD
  action('prepend',  { id: 'fr_svod', orgId: 'x', next: [], percent: 0 }),
  action('prepend',  { id: 'jokers_fr_svod_com', orgId: 'jokers', next: 'fr_svod', percent: 0.2 }),


  
  action('prependHorizontal', {
    id: 'rnpp_fr',
    blameId: 'charades',
    next: ['jokers_fr_video_expense', 'jokers_fr_svod_com', 'jokers_fr_tv_com'],
    children: [
      { type: 'right', id: 'jokers_fr_tv_svod_expense', pools: ['jokers_expense_group'], orgId: 'jokers', percent: 0.2, conditions: and([
        condition('poolRevenu', { pool: 'jokers_expense_group', operator: '<', target: { id: 'jokers', in: 'orgs.expense', percent: 1 }}),
        condition('terms', { type: 'medias', operator: 'in', list: ['tv', 'svod'] })
      ]) },
      { type: 'right', id: 'jokers_fr_tv_svod_mg', pools: ['jokers_mg_group'], orgId: 'jokers', percent: 0.2, conditions: and([
        condition('poolRevenu', { pool: 'jokers_mg_group', operator: '<', target: 60_000 }),
        condition('terms', { type: 'medias', operator: 'in', list: ['tv', 'svod'] })
      ]) },
      { type: 'right', id: 'jokers_fr_cine_video_mg', pools: ['jokers_mg_group'], orgId: 'jokers', percent: 0.85, conditions: and([
        condition('poolRevenu', { pool: 'jokers_mg_group', operator: '<', target: 60_000 }),
        condition('terms', { type: 'medias', operator: 'in', list: ['cine', 'vod', 'dvd'] })
      ]) },
      { type: 'vertical', id: 'cineaxe_rnpp_fr_video_cine', children: [
        { type: 'right', id: 'cineaxe_rnpp_fr_video_cine_1', orgId: 'cineaxe', percent: 0.075, conditions: and([
          condition('poolRevenu', { pool: 'jokers_mg_group', operator: '<', target: 60_000 }),
          condition('terms', { type: 'medias', operator: 'not-in', list: ['tv', 'svod'] })
        ]) },
        { type: 'right', id: 'cineaxe_rnpp_fr_video_cine_2', orgId: 'cineaxe', percent: 0.325, conditions: and([
          condition('orgRevenu', { orgId: 'cineaxe', operator: '<', target: 150_000 }),
          condition('terms', { type: 'medias', operator: 'not-in', list: ['tv', 'svod'] })
        ]) },
        { type: 'right', id: 'cineaxe_rnpp_fr_video_cine_3', orgId: 'cineaxe', percent: 0.05 }
      ] },
      { type: 'vertical', id: 'cineaxe_rnpp_fr_tv_svod', children: [
        { type: 'right', id: 'cineaxe_rnpp_fr_tv_svod_1', orgId: 'cineaxe', percent: 0.36, conditions: and([
          condition('orgRevenu', { orgId: 'cineaxe', operator: '<', target: 150_000 }),
          condition('terms', { type: 'medias', operator: 'in', list: ['tv', 'svod'] })
        ]) },
        { type: 'right', id: 'cineaxe_rnpp_fr_tv_svod_2', orgId: 'cineaxe', percent: 0.05 }
      ] },
      { type: 'vertical', id: 'cinecap_rnpp_fr_video_cine', children: [
        { type: 'right', id: 'cinecap_rnpp_fr_video_cine_1', orgId: 'cinecap', percent: 0.075, conditions: and([
          condition('poolRevenu', { pool: 'jokers_mg_group', operator: '<', target: 60_000 }),
          condition('terms', { type: 'medias', operator: 'not-in', list: ['tv', 'svod'] })
        ]) },
        { type: 'right', id: 'cinecap_rnpp_fr_video_cine_2', orgId: 'cinecap', percent: 0.325, conditions: and([
          condition('orgRevenu', { orgId: 'cinecap', operator: '<', target: 150_000 }),
          condition('terms', { type: 'medias', operator: 'not-in', list: ['tv', 'svod'] })
        ]) },
        { type: 'right', id: 'cinecap_rnpp_fr_video_cine_3', orgId: 'cinecap', percent: 0.05 }
      ] },
      { type: 'vertical', id: 'cinecap_rnpp_fr_tv_svod', children: [
        { type: 'right', id: 'cinecap_rnpp_fr_tv_svod_1', orgId: 'cinecap', percent: 0.36, conditions: and([
          condition('orgRevenu', { orgId: 'cinecap', operator: '<', target: 150_000 }),
          condition('terms', { type: 'medias', operator: 'in', list: ['tv', 'svod'] })
        ]) },
        { type: 'right', id: 'cinecap_rnpp_fr_tv_svod_2', orgId: 'cinecap', percent: 0.05 }
      ] },
      // Canadian share //
      {
        type: 'horizontal',
        percent: 0.1479,
        id: 'canadian_share',
        blameId: 'hg',
        children: [
          { type: 'vertical', id: 'hg_rnpp_fr', children: [
            { type: 'right', id: 'hg_rnpp_fr_1', orgId: 'hg', percent: 0.0769, conditions: and([
              condition('poolRevenu', { pool: 'jokers_mg_group', operator: '<', target: 60_000 }),
              condition('orgRevenu', { orgId: 'cip', operator: '<', target: 86_307 }),
            ]) },
            { type: 'right', id: 'hg_rnpp_fr_2', orgId: 'hg', percent: 0.1538, conditions: and([
              condition('orgRevenu', { orgId: 'hg', operator: '<', target: 64_516 }),
            ]) }
          ] },
          { type: 'vertical', id: 'telefilm_rnpp_fr', children: [
            { type: 'right', id: 'telefilm_rnpp_fr_1', orgId: 'telefilm', percent: 0.1923, conditions: and([
              condition('poolRevenu', { pool: 'jokers_mg_group', operator: '<', target: 60_000 }),
              condition('orgRevenu', { orgId: 'cip', operator: '<', target: 86_307 }),
            ]) },
            { type: 'right', id: 'telefilm_rnpp_fr_2', orgId: 'telefilm', percent: 0.3846, conditions: and([
              condition('orgRevenu', { orgId: 'telefilm', operator: '<', target: 64_516 }),
            ]) }
          ] },
          { type: 'vertical', id: 'sodec_rnpp_fr', children: [
            { type: 'right', id: 'sodec_rnpp_fr_1', orgId: 'sodec', percent: 0.2308, conditions: and([
              condition('poolRevenu', { pool: 'jokers_mg_group', operator: '<', target: 60_000 }),
              condition('orgRevenu', { orgId: 'cip', operator: '<', target: 86_307 }),
            ]) },
            { type: 'right', id: 'sodec_rnpp_fr_2', orgId: 'sodec', percent: 0.4615, conditions: and([
              condition('orgRevenu', { orgId: 'sodec', operator: '<', target: 64_516 }),
            ]) }
          ] },
          { type: 'right', id: 'microscope_rnpp_fr', orgId: 'microscope', percent: 0.0023, conditions: and([
            condition('poolRevenu', { pool: 'jokers_mg_group', operator: '<', target: 60_000 }),
          ])},
          { type: 'right', id: 'cip_rnpp_fr', orgId: 'cip', percent: 0.4977, conditions: and([
            condition('poolRevenu', { pool: 'jokers_mg_group', operator: '<', target: 60_000 }),
          ])},
          { type: 'right', id: 'cif_rnpp_fr', orgId: 'cif', percent: 1, conditions: and([
            condition('orgRevenu', { orgId: 'sodec', operator: '<', target: 64_516 }),
          ])},
        ]
      }
    ]
  }),



  //////////////
  // RESIDUAL //
  //////////////
  action('prependHorizontal', {
    id: 'residuals',
    next: ['rnpp_row', 'rnpp_fr'],
    blameId: 'poison',
    children: [
      { type: 'vertical', id: 'avenueb_residuals', children: [
        { type: 'right', id: 'avenueb_residuals_1', orgId: 'avenueb', percent: 0.5, conditions: and([
          condition('orgRevenu', { orgId: 'poison', operator: '<', target: 50_000 }),
          // todo deficit
        ]) },
        { type: 'right', id: 'avenueb_residuals_2', orgId: 'avenueb', percent: 1, conditions: and([
          // todo deficit ????
        ]) },
        { type: 'right', id: 'avenueb_residuals_3', orgId: 'avenueb', percent: 0.85 },
      ] },
      { type: 'vertical', id: 'poison_residuals', children: [
        { type: 'right', id: 'poison_residuals_1', orgId: 'poison', percent: 0.5, conditions: and([
          condition('orgRevenu', { orgId: 'poison', operator: '<', target: 50_000 }),
          // todo deficit
        ]) },
        { type: 'right', id: 'poison_residuals_2', orgId: 'poison', percent: 1, conditions: and([
          // todo deficit ????
        ]) }
      ] },
    ],
  })

]