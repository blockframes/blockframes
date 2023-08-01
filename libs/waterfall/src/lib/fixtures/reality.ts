import { and, condition, Action, action } from '@blockframes/model';

export const actions: Action[] = [
  // Plan de financement

  // action('invest', { orgId: 'versus' }),
  action('invest', { orgId: 'realitism-film', amount: 50_000 }),
  action('invest', { orgId: 'manon-3', amount: 100_000, date: new Date('2/2/2000') }),
  action('invest', { orgId: 'manon-2', amount: 100_000, date: new Date('2/2/2000') }),
  action('invest', { orgId: 'postal-5', amount: 50_000 }),
  action('invest', { orgId: 'postal-6', amount: 150_000 }),
  action('invest', { orgId: 'org_canal+', amount: 517_132 }),
  action('invest', { orgId: 'cine+', amount: 20_300 }),
  action('invest', { orgId: 'cnc', amount: 550_000 }),

  // Rnpp
  action('prepend', { id: 'rnpp', orgId: 'producer', next: [], percent: 1}),

  // Manon-3
  action('prepend', { id: 'fr_tv_manon-3', orgId: 'manon-3', next: 'rnpp', percent: 0.2, conditions: and([
    condition('terms', { type: 'territories', operator: 'in', list: ['france'] }),
    condition('terms', { type: 'medias', operator: 'in', list: ['tv'] }),
    condition('interest', { orgId: 'manon-3', rate: 0.02 }),
  ])}),
  action('prepend', { id: 'derived_manon-3', orgId: 'manon-3', next: 'rnpp', percent: 0.075, conditions: and([
    condition('terms', { type: 'medias', operator: 'in', list: ['derived'] }),
    condition('interest', { orgId: 'manon-3', rate: 0.02 }),
  ])}),
  action('prepend', { id: 'fr_not_tv_manon-3', orgId: 'manon-3', next: 'rnpp', percent: 0.25, conditions: and([
    condition('rightRevenu', { rightId: 'fr_not_tv_manon-3', operator: '<', target: 25_000 }),
    condition('interest', { orgId: 'manon-3', rate: 0.02 }),
    condition('terms', { type: 'territories', operator: 'in', list: ['france'] }),
    condition('terms', { type: 'medias', operator: 'not-in', list: ['tv', 'derived'] }),
  ])}),
  action('prepend', { id: 'row_manon-3', orgId: 'manon-3', next: 'rnpp', percent: 0.25, conditions: and([
    condition('rightRevenu', { rightId: 'row_manon-3', operator: '<', target: 50_000 }),
    condition('interest', { orgId: 'manon-3', rate: 0.02 }),
    condition('terms', { type: 'territories', operator: 'not-in', list: ['france'] }),
    condition('terms', { type: 'medias', operator: 'not-in', list: ['derived'] }),
  ])}),
  action('prepend', { id: 'fr_com_manon-3', orgId: 'manon-3', next: 'fr_not_tv_manon-3', percent: 0.125, conditions: and([
    condition('interest', { orgId: 'manon-3', rate: 0.02 }),
  ])}),
  action('prepend', { id: 'row_com_manon-3', orgId: 'manon-3', next: 'row_manon-3', percent: 0.125, conditions: and([
    condition('interest', { orgId: 'manon-3', rate: 0.02 }),
  ])}),
  action('prepend', { id: 'final_com_manon-3', orgId: 'manon-3', percent: 0.035, next: ['fr_com_manon-3', 'row_com_manon-3', 'fr_tv_manon-3', 'derived_manon-3'], conditions: and([
    condition('orgRevenu', { orgId: 'manon-3', operator: '>=', target: 150_000 }),
  ])}),


  // Manon-2
  action('prepend', { id: 'fr_tv_manon-2', orgId: 'manon-2', next: 'rnpp', percent: 0.2, conditions: and([
    condition('terms', { type: 'territories', operator: 'in', list: ['france'] }),
    condition('terms', { type: 'medias', operator: 'in', list: ['tv'] }),
    condition('orgRevenu', { orgId: 'manon-2', operator: '<', target: 150_000 }),
  ])}),
  action('prepend', { id: 'derived_manon-2', orgId: 'manon-2', next: 'rnpp', percent: 0.075, conditions: and([
    condition('terms', { type: 'medias', operator: 'in', list: ['derived'] }),
    condition('orgRevenu', { orgId: 'manon-2', operator: '<', target: 150_000 }),
  ])}),
  action('prepend', { id: 'fr_not_tv_manon-2', orgId: 'manon-2', next: 'rnpp', percent: 0.25, conditions: and([
    condition('rightRevenu', { rightId: 'fr_not_tv_manon-2', operator: '<', target: 25_000 }),
    condition('orgRevenu', { orgId: 'manon-2', operator: '<', target: 150_000 }),
    condition('terms', { type: 'territories', operator: 'in', list: ['france'] }),
    condition('terms', { type: 'medias', operator: 'not-in', list: ['tv', 'derived'] }),
  ])}),
  action('prepend', { id: 'row_manon-2', orgId: 'manon-2', next: 'rnpp', percent: 0.25, conditions: and([
    condition('rightRevenu', { rightId: 'row_manon-2', operator: '<', target: 50_000 }),
    condition('orgRevenu', { orgId: 'manon-2', operator: '<', target: 150_000 }),
    condition('terms', { type: 'territories', operator: 'not-in', list: ['france'] }),
    condition('terms', { type: 'medias', operator: 'not-in', list: ['derived'] }),
  ])}),
  action('prepend', { id: 'fr_com_manon-2', orgId: 'manon-2', next: 'fr_not_tv_manon-2', percent: 0.125, conditions: and([
    condition('orgRevenu', { orgId: 'manon-2', operator: '<', target: 150_000 }),
  ])}),
  action('prepend', { id: 'row_com_manon-2', orgId: 'manon-2', next: 'row_manon-2', percent: 0.125, conditions: and([
    condition('orgRevenu', { orgId: 'manon-2', operator: '<', target: 150_000 }),
  ])}),
  action('prepend', { id: 'final_com_manon-2', orgId: 'manon-2', percent: 0.035, next: ['fr_com_manon-2', 'row_com_manon-2', 'fr_tv_manon-2', 'derived_manon-2'], conditions: and([
    condition('orgRevenu', { orgId: 'manon-2', operator: '>=', target: 150_000 }),
  ])}),

  action('prepend', { id: 'rest_producer', orgId: 'producer', next: ['final_com_manon-2', 'final_com_manon-3'], percent: 1 }),

  // MG
  action('invest', { orgId: 'rubber-films ', amount: 25_000 }),

  // Indie sales
  action('append', { id: 'expense_indie', orgId: 'indie-sales', percent: 1, previous: 'rnpp', conditions: and([
    condition('rightRevenu', { rightId: 'expense_indie', operator: '<', target: 34_203 })
  ]) }),
  action('appendHorizontal', { id: 'com_indie', blameId: 'indie-sales', previous: 'expense_indie', children: [
    { type: 'right', id: 'cnc_indie_com', orgId: 'cnc', percent: 0.0055 },
    { type: 'right', id: 'internal_com_indie', orgId: 'indie-sales', percent: 0.15, conditions: and([
      condition('terms', { type: 'medias', operator: 'not-in', list: ['festival'] }),
    ])},
  ]}),
  action('appendHorizontal', { id: 'festival_indie', blameId: 'indie-sales', previous: 'expense_indie', children: [
    { type: 'right', id: 'cnc_indie_festival', orgId: 'cnc', percent: 0.0055 },
    { type: 'right', id: 'festival_com_indie', orgId: 'indie-sales', percent: 0.5, conditions: and([
      condition('terms', { type: 'medias', operator: 'in', list: ['festival'] }),
    ])},
  ]}),

  // Diaphana
  action('append', { id: 'expense_diaphana', orgId: 'diaphana', previous: 'rnpp', percent: 1, conditions: and([
    condition('rightRevenu', { rightId: 'expense_diaphana', operator: '<', target: 302_339 })
  ])}),
  action('append', { id: 'cnc_diaphana', orgId: 'cnc', previous: 'expense_diaphana', percent: 0.0058 }),
  action('append', { id: 'cine_diaphana', orgId: 'diaphana', previous: 'cnc_diaphana', percent: 0.2 }),
  action('append', { id: 'com_canal_diaphana', orgId: 'diaphana', previous: 'expense_diaphana', percent: 0.5 }),
  
  
  // video
  action('append', { id: 'provision_diaphana', orgId: 'diaphana', previous: 'rnpp', percent: 0.3 }),
  // action('append', { id: 'tax_diaphana', orgId: 'diaphana', previous: 'provision_diaphana', percent: 0.3 }),
  action('append', { id: 'dvd_diaphana', orgId: 'diaphana', previous: 'tax_diaphana', percent: 0.25 }),


  action('income', { id: 'salle_fr', from: 'salle_fr', to: 'cine_diaphana', amount: 303_770, medias: ['cine'], territories: ['france'] }),
  action('income', { id: 'support_canal', from: 'support_canal', to: 'com_canal_diaphana', amount: 35_000, medias: [], territories: ['france'] }),
  // action('income', { id: 'dvd_sell_fr', from: 'dvd_sell_fr', to: '', amount: 10_000, medias: ['dvd_sell'], territories: ['france'] }),
  // action('income', { id: 'dvd_op_fr', from: 'dvd_op_fr', to: '', amount: 1_470_307, medias: ['dvd_op'], territories: ['france'] }),
  action('income', { id: 'usa', from: 'usa', to: 'com_indie', amount: 5_370, medias: [], territories: ['usa'] }),
  action('income', { id: 'row', from: 'row', to: 'com_indie', amount: 15_383, medias: [], territories: ['row'] }),
  // action('income', { id: 'row_festival', from: 'festival_indie', to: '', amount: 218_642, medias: ['festival'], territories: ['row'] }),

  // TODO: CNC
  action('income', { id: 'perriot->indie', from: 'perriot', to: 'com_indie', amount: 50_000, medias: [], territories: [] }),
  action('income', { id: 'spectator->indie', from: 'spectator', to: 'com_indie', amount: 5_000, medias: [], territories: [] }),
  // action('income', { id: '****->indie', to: 'com_indie', amount: 1_606, medias: [], territories: [] }),
  // action('income', { id: '****->indie', to: 'com_indie', amount: 7_600, medias: [], territories: [] }),
  // action('income', { id: '****->indie', to: 'com_indie', amount: 2_500, medias: [], territories: [] }),
  action('income', { id: 'festival->indie', from: 'festival', to: 'festival_indie', amount: 15_650, medias: [], territories: [] }),
  

];