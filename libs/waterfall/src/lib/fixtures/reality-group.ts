import { and, condition, Action, action } from '@blockframes/model';

export const actions: Action[] = [
  // CNC
  action('prepend', { id: 'cnc_com_cine_fr', next: [], orgId: 'cnc', percent: 0.0058 }),

  // indie
  action('prependHorizontal', {
    id: 'com_row',
    blameId: 'indie',
    next: [],
    children: [
      { type: 'right', id: 'cnc_com_row', orgId: 'cnc', percent: 0.0055 },
      { type: 'right', id: 'indie_com_row', orgId: 'indie', percent: 0.15 }
    ]
  }),
  action('prependHorizontal', {
    id: 'com_row_festival',
    blameId: 'indie',
    next: [],
    children: [
      { type: 'right', id: 'cnc_com_row_festival', orgId: 'cnc', percent: 0.0055 },
      { type: 'right', id: 'indie_com_row_festival', orgId: 'indie', percent: 0.5 }
    ]
  }),
  action('prepend', { id: 'indie_expense_row', next: ['com_row', 'com_row_festival'], orgId: 'indie', percent: 1, conditions: and([
    condition('rightRevenu', { rightId: 'indie_expense_row', operator: '<', target:  38_849 })
  ]) }),




  // Rubber
  action('prependHorizontal', {
    id: 'com_us',
    blameId: 'rubber',
    next: [],
    children: [
      { type: 'right', id: 'cnc_com_us', orgId: 'cnc', percent: 0.0055 },
      { type: 'right', id: 'rubber_com', orgId: 'rubber', percent: 0.15 }
    ]
  }),

  // Diaphana
  // cine
  action('prepend', { id: 'diaphana_cine_fr', next: [], orgId: 'diaphana', percent: 0.2 }),
  action('prepend', { id: 'cnc_com_cine_fr', next: ['diaphana_cine_fr'], orgId: 'cnc', percent: 0.0058 }),
  action('prepend', { id: 'diaphana_canal', next: [], orgId: 'diaphana', percent: 0.5 }),
  action('prepend', { id: 'diaphana_expense_cine_fr', next: ['cnc_com_cine_fr', 'diaphana_canal'], orgId: 'diaphana', percent: 1, conditions: and([
    condition('rightRevenu', { rightId: 'diaphana_expense_cine_fr', operator: '<', target: 301_000 })
  ]) }),
  // video
  action('prepend', { id: 'diaphana_dvd_sell_fr', next: [], orgId: 'diaphana', percent: 0.75 }),
  action('prepend', { id: 'diaphana_dvd_op_fr', next: [], orgId: 'diaphana', percent: 0.85 }),
  action('prepend', { id: 'diaphana_vod_fr', next: [], orgId: 'diaphana', percent: 0.4 }),
  action('prepend', { id: 'diaphana_provision', next: ['diaphana_dvd_sell_fr', 'diaphana_dvd_op_fr', 'diaphana_vod_fr'], orgId: 'diaphana', percent: 1, conditions: and([
    condition('rightRevenu', { rightId: 'diaphana_provision', operator: '<', target:  1_214.16 })
  ]) }),
  action('prepend', { id: 'diaphana_expense_video_fr', next: ['diaphana_provision'], orgId: 'diaphana', percent: 1, conditions: and([
    condition('rightRevenu', { rightId: 'diaphana_expense_video_fr', operator: '<', target:  1_205.16 })
  ]) }),

  // Realitism
  action('prependHorizontal', {
    id: 'realitism_com',
    blameId: 'realitism',
    next: [],
    children: [
      { type: 'right', id: 'realitism_com_1', orgId: 'realitism', percent: 0.075, conditions: and([
        condition('contractAmount', { operator: '<', target: 50_000 }),
      ]) },
      { type: 'right', id: 'realitism_com_2', orgId: 'realitism', percent: 0.05, conditions: and([
        condition('contractAmount', { operator: '>=', target: 50_000 }),
      ]) },
    ]
  }),

  // RNPP fr
  action('prependHorizontal', {
    id: 'rnpp_fr',
    blameId: 'producer',
    next: ['diaphana_expense_cine_fr', 'diaphana_expense_video_fr'],
    children: [
      // LBPI5
      { type: 'vertical', id: 'lbpi5_fr', children: [
        { type: 'right', id: 'lbpi5_fr_1', orgId: 'lbpi5', percent: 0.125, conditions: and([
          condition('orgRevenu', { orgId: 'lbpi5', operator: '<', target: 12_500 }),
        ]) },
        { type: 'right', id: 'lbpi5_fr_2', orgId: 'lbpi5', percent: 0.0625, conditions: and([
          condition('interest', { orgId: 'lbpi5', rate: 0.025 }),
        ]) },
        { type: 'right', id: 'lbpi5_fr_3', orgId: 'lbpi5', percent: 0.0188 },
      ]},
      // LBPI6
      { type: 'vertical', id: 'lbpi6_fr', children: [
        { type: 'right', id: 'lbpi6_fr_1', orgId: 'lbpi6', percent: 0.375, conditions: and([
          condition('orgRevenu', { orgId: 'lbpi6', operator: '<', target: 37_500 }),
        ]) },
        { type: 'right', id: 'lbpi6_fr_2', orgId: 'lbpi6', percent: 0.1875, conditions: and([
          condition('interest', { orgId: 'lbpi6', rate: 0.025 }),
        ]) },
        { type: 'right', id: 'lbpi6_fr_3', orgId: 'lbpi6', percent: 0.0562 },
      ]},
      // Manon2
      { type: 'vertical', id: 'manon_2_fr', children: [
        { type: 'right', id: 'manon_2_fr_1', orgId: 'manon_2', percent: 0.25, conditions: and([
          condition('orgRevenu', { orgId: 'manon_2', operator: '<', target: 25_000 }),
        ]) },
        { type: 'right', id: 'manon_2_fr_2', orgId: 'manon_2', percent: 0.12, conditions: and([
          condition('interest', { orgId: 'manon_2', rate: 0.025 }),
        ]) },
        { type: 'right', id: 'manon_2_fr_3', orgId: 'manon_2', percent: 0.035 },
      ]},
      // Manon2
      { type: 'vertical', id: 'manon_3_fr', children: [
        { type: 'right', id: 'manon_3_fr_1', orgId: 'manon_3', percent: 0.25, conditions: and([
          condition('orgRevenu', { orgId: 'manon_3', operator: '<', target: 25_000 }),
        ]) },
        { type: 'right', id: 'manon_3_fr_2', orgId: 'manon_3', percent: 0.12, conditions: and([
          condition('interest', { orgId: 'manon_3', rate: 0.025 }),
        ]) },
        { type: 'right', id: 'manon_3_fr_3', orgId: 'manon_3', percent: 0.035 },
      ]},
    ]
  }),

  // RNPP row
  action('prependHorizontal', {
    id: 'rnpp_row',
    blameId: 'producer',
    next: ['indie_expense_row'],
    children: [
      // LBPI5
      { type: 'vertical', id: 'lbpi5_row', children: [
        { type: 'right', id: 'lbpi5_row_1', orgId: 'lbpi5', percent: 0.125, conditions: and([
          condition('orgRevenu', { orgId: 'lbpi5', operator: '<', target: 12_500 }),
        ]) },
        { type: 'right', id: 'lbpi5_row_2', orgId: 'lbpi5', percent: 0.0625, conditions: and([
          condition('interest', { orgId: 'lbpi5', rate: 0.025 }),
        ]) },
        { type: 'right', id: 'lbpi5_row_3', orgId: 'lbpi5', percent: 0.0188 },
      ]},
      // LBPI6
      { type: 'vertical', id: 'lbpi6_row', children: [
        { type: 'right', id: 'lbpi6_row_1', orgId: 'lbpi6', percent: 0.375, conditions: and([
          condition('orgRevenu', { orgId: 'lbpi6', operator: '<', target: 37_500 }),
        ]) },
        { type: 'right', id: 'lbpi6_row_2', orgId: 'lbpi6', percent: 0.1875, conditions: and([
          condition('interest', { orgId: 'lbpi6', rate: 0.025 }),
        ]) },
        { type: 'right', id: 'lbpi6_row_3', orgId: 'lbpi6', percent: 0.0562 },
      ]},
      // Manon2
      { type: 'vertical', id: 'manon_2_row', children: [
        { type: 'right', id: 'manon_2_row_1', orgId: 'manon_2', percent: 0.25, conditions: and([
          condition('orgRevenu', { orgId: 'manon_2', operator: '<', target: 25_000 }),
        ]) },
        { type: 'right', id: 'manon_2_row_2', orgId: 'manon_2', percent: 0.12, conditions: and([
          condition('interest', { orgId: 'manon_2', rate: 0.025 }),
        ]) },
        { type: 'right', id: 'manon_2_row_3', orgId: 'manon_2', percent: 0.035 },
      ]},
      // Manon2
      { type: 'vertical', id: 'manon_3_row', children: [
        { type: 'right', id: 'manon_3_row_1', orgId: 'manon_3', percent: 0.25, conditions: and([
          condition('orgRevenu', { orgId: 'manon_3', operator: '<', target: 25_000 }),
        ]) },
        { type: 'right', id: 'manon_3_row_2', orgId: 'manon_3', percent: 0.12, conditions: and([
          condition('interest', { orgId: 'manon_3', rate: 0.025 }),
        ]) },
        { type: 'right', id: 'manon_3_row_3', orgId: 'manon_3', percent: 0.035 },
      ]},
    ]
  }),

  // RNPP row
  action('prependHorizontal', {
    id: 'rnpp_us',
    blameId: 'producer',
    next: ['com_us'],
    children: [
      // LBPI5
      { type: 'vertical', id: 'lbpi5_us', children: [
        { type: 'right', id: 'lbpi5_us_1', orgId: 'lbpi5', percent: 0.125, conditions: and([
          condition('orgRevenu', { orgId: 'lbpi5', operator: '<', target: 12_500 }),
        ]) },
        { type: 'right', id: 'lbpi5_us_2', orgId: 'lbpi5', percent: 0.0625, conditions: and([
          condition('interest', { orgId: 'lbpi5', rate: 0.025 }),
        ]) },
        { type: 'right', id: 'lbpi5_us_3', orgId: 'lbpi5', percent: 0.0188 },
      ]},
      // LBPI6
      { type: 'vertical', id: 'lbpi6_us', children: [
        { type: 'right', id: 'lbpi6_us_1', orgId: 'lbpi6', percent: 0.375, conditions: and([
          condition('orgRevenu', { orgId: 'lbpi6', operator: '<', target: 37_500 }),
        ]) },
        { type: 'right', id: 'lbpi6_us_2', orgId: 'lbpi6', percent: 0.1875, conditions: and([
          condition('interest', { orgId: 'lbpi6', rate: 0.025 }),
        ]) },
        { type: 'right', id: 'lbpi6_us_3', orgId: 'lbpi6', percent: 0.0562 },
      ]},
      // Manon2
      { type: 'vertical', id: 'manon_2_us', children: [
        { type: 'right', id: 'manon_2_us_1', orgId: 'manon_2', percent: 0.25, conditions: and([
          condition('orgRevenu', { orgId: 'manon_2', operator: '<', target: 25_000 }),
        ]) },
        { type: 'right', id: 'manon_2_us_2', orgId: 'manon_2', percent: 0.12, conditions: and([
          condition('interest', { orgId: 'manon_2', rate: 0.025 }),
        ]) },
        { type: 'right', id: 'manon_2_us_3', orgId: 'manon_2', percent: 0.035 },
      ]},
      // Manon2
      { type: 'vertical', id: 'manon_3_us', children: [
        { type: 'right', id: 'manon_3_us_1', orgId: 'manon_3', percent: 0.25, conditions: and([
          condition('orgRevenu', { orgId: 'manon_3', operator: '<', target: 25_000 }),
        ]) },
        { type: 'right', id: 'manon_3_us_2', orgId: 'manon_3', percent: 0.12, conditions: and([
          condition('interest', { orgId: 'manon_3', rate: 0.025 }),
        ]) },
        { type: 'right', id: 'manon_3_us_3', orgId: 'manon_3', percent: 0.035 },
      ]},
    ]
  }),

  // RNPP france tv
  action('prependHorizontal', {
    id: 'rnpp_fr_tv',
    blameId: 'producer',
    next: ['realitism_com'],
    children: [
      // LBPI5
      { type: 'vertical', id: 'lbpi5_fr_tv', children: [
        { type: 'right', id: 'lbpi5_fr_tv_1', orgId: 'lbpi5', percent: 0.1, conditions: and([
          condition('interest', { orgId: 'lbpi5', rate: 0.025 }),
        ]) },
        { type: 'right', id: 'lbpi5_fr_tv_2', orgId: 'lbpi5', percent: 0.0188 },
      ]},
      // LBPI6
      { type: 'vertical', id: 'lbpi6_fr_tv', children: [
        { type: 'right', id: 'lbpi6_fr_tv_1', orgId: 'lbpi6', percent: 0.3, conditions: and([
          condition('interest', { orgId: 'lbpi6', rate: 0.025 }),
        ]) },
        { type: 'right', id: 'lbpi6_fr_tv_2', orgId: 'lbpi6', percent: 0.0562 },
      ]},
      // Manon2
      { type: 'vertical', id: 'manon_2_fr_tv', children: [
        { type: 'right', id: 'manon_2_fr_tv_1', orgId: 'manon_2', percent: 0.2, conditions: and([
          condition('interest', { orgId: 'manon_2', rate: 0.025 }),
        ]) },
        { type: 'right', id: 'manon_2_fr_tv_2', orgId: 'manon_2', percent: 0.035 },
      ]},
      // Manon2
      { type: 'vertical', id: 'manon_3_fr_tv', children: [
        { type: 'right', id: 'manon_3_fr_tv_1', orgId: 'manon_3', percent: 0.2, conditions: and([
          condition('interest', { orgId: 'manon_3', rate: 0.025 }),
        ]) },
        { type: 'right', id: 'manon_3_fr_tv_2', orgId: 'manon_3', percent: 0.035 },
      ]},
    ]
  }),

  action('prepend', { id: 'rest', orgId: 'realitism', next: ['rnpp_fr', 'rnpp_row', 'rnpp_us', 'rnpp_fr_tv'], percent: 1 }),

  // TODO: add invest
  // action('invest', { orgId: 'lbpi5', date: new Date('12/01/2017'), amount: 100_000 }),

  // TODO: add contract

  action('income', { id: 'cine_fr', from: 'cine_fr', to: 'diaphana_cine_fr', amount: 190_116.97, media: ['cine'], territory: ['france'] }),
  action('income', { id: 'support_canal', from: 'support_canal', to: 'diaphana_canal', amount: 42_700, media: [], territory: ['france'] }),
  action('income', { id: 'dvd_sell_fr', from: 'dvd_sell_fr', to: 'diaphana_dvd_sell_fr', amount: 31_987, media: ['dvd_sell'], territory: ['france'] }),
  action('income', { id: 'dvd_op_fr', from: 'dvd_op_fr', to: 'diaphana_dvd_op_fr', amount: 12_487, media: ['dvd_op'], territory: ['france'] }),
  action('income', { id: 'vod_fr', from: 'vod_fr', to: 'diaphana_vod_fr', amount: 13_751, media: ['dvd_op'], territory: ['france'] }),
  action('income', { id: 'usa', from: 'usa', to: 'com_us', amount: 2_431, media: [], territory: ['usa'] }),
  action('income', { id: 'row', from: 'row', to: 'com_row', amount: 64_275, media: [], territory: ['row'] }),
  action('income', { id: 'row_festival', from: 'row_festival', to: 'com_row_festival', amount: 15_650, media: ['festival'], territory: ['row'] }),
  action('income', { id: 'cnc_support', from: 'cnc_support', to: 'indie_expense_row', amount: 4_646.5, media: ['festival'], territory: ['row'] }),
];