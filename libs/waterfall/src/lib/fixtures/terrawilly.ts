import { and, condition, or } from '../conditions';
import { Action, action } from '../action';

export const actions: Action[] = [
  action('invest', { orgId: 'tat', amount: 2_637_006 }),
  action('invest', { orgId: 'bac', amount: 50_000 }),
  action('invest', { orgId: 'master', amount: 100_000 }),
  action('invest', { orgId: 'france_tv', amount: 400_000 }),
  action('invest', { orgId: 'ocs', amount: 300_000 }),
  action('invest', { orgId: 'ocs', amount: 100_000 }),
  action('invest', { orgId: 'lp', amount: 300_000 }),

  // CNC support
  action('prepend', { id: 'cnc_support', orgId: 'cnc', next: [], percent: 0}),
  action('prepend', { id: 'tat_cnc_support', orgId: 'tat', next: 'cnc_support', percent: 1, conditions: and([
    condition('rightRevenu', { rightId: 'tat_cnc_support', operator: '<', target: 150_000 })
  ])}),

  action('prependVertical', { id: 'lp_support', next: 'tat_cnc_support', children: [
    { type: 'right', id: 'lp_support_1', orgId: 'lp', percent: 0.1, conditions: and([
      condition('orgRevenu', { orgId: 'lp', operator: '<', target: 360_000 }),
      condition('rightRevenu', { rightId: 'bac_rnpp_com', operator: '<', target: 50_000 }),
    ])},
    { type: 'right', id: 'lp_support_2', orgId: 'lp', percent: 0.15 },
  ] }),

  // RNPP
  action('prepend', { id: 'rnpp', orgId: 'tat', next: [], percent: 0}),
  action('prependVertical', { id: 'france_tv_com', next: ['rnpp', 'tat_cnc_support'], children: [
    { type: 'right', id: 'france_tv_com_1', orgId: 'france_tv', percent: 0.1, conditions: and([
      condition('orgRevenu', { orgId: 'france_tv', operator: '<', target: 160_000, blocking: true }),
    ]) },
    { type: 'right',  id: 'france_tv_com_2', orgId: 'france_tv', percent: 0.07  },
  ] }),

  action('prependVertical', { id: 'bac_rnpp_com', next: ['rnpp', 'tat_cnc_support'], children: [
    { type: 'right', id: 'bac_rnpp_com_1', orgId: 'bac', percent: 0.2, conditions: and([
      condition('rightRevenu', { rightId: 'bac_rnpp_com', operator: '<', target: 50_000, blocking: true })
    ]) },
    { type: 'right', id: 'bac_rnpp_com_2', orgId: 'bac', percent: 0.15 }
  ] }),

  action('prependVertical', { id: 'lp_com', next: 'rnpp', children: [
    { type: 'right', id: 'lp_com_1', orgId: 'lp', percent: 0.55, conditions: and([
      condition('rightRevenu', { rightId: 'bac_rnpp_com', operator: '<', target: 50_000 })
    ]) },
    { type: 'right',  id: 'lp_com_2', orgId: 'lp', percent: 0.6, conditions: and([
      condition('orgRevenu', { orgId: 'lp', operator: '<', target: 360_000 })
    ]) },
    { type: 'right',  id: 'lp_com_3', orgId: 'lp', percent: 0.15 },
  ] }),
  
  action('prependVertical', { id: 'master_com', next: 'rnpp', children: [
    { type: 'right',  id: 'master_com_1', orgId: 'master', percent: 0.05 },
  ]}),
  
  // Seller
  action('append', { id: 'bac_mg', orgId: 'bac', previous: 'rnpp', percent: 1, conditions: and([
    condition('rightRevenu', { rightId: 'bac_mg', operator: '<', target: 1_150_000 })
  ]) }),
  action('append', { id: 'bac_fr_expense', orgId: 'bac', previous: 'bac_mg', percent: 1, conditions: and([
    condition('rightRevenu', { rightId: 'bac_fr_expense', operator: '<', target: 738_127 })
  ]) }),
  action('append', { id: 'bac_row_expense', orgId: 'bac', previous: 'bac_mg', percent: 1, conditions: and([
    condition('rightRevenu', { rightId: 'bac_row_expense', operator: '<', target: 80_000 })
  ]) }),
  action('append', { id: 'bac_fr_com_tv', orgId: 'bac', previous: 'bac_fr_expense', percent: 0.15 }),
  action('append', { id: 'bac_fr_com_ancillary', orgId: 'bac', previous: 'bac_fr_expense', percent: 0.5 }),
  action('append', { id: 'bac_fr_com_cine', orgId: 'bac', previous: 'bac_fr_expense', percent: 0.3 }),
  action('append', { id: 'bac_fr_com_dvd_rent', orgId: 'bac', previous: 'bac_fr_expense', percent: 0.7 }),
  action('append', { id: 'bac_fr_com_dvd_sell', orgId: 'bac', previous: 'bac_fr_expense', percent: 0.85 }),
  action('append', { id: 'bac_fr_com_dvd_op', orgId: 'bac', previous: 'bac_fr_expense', percent: 0.9 }),
  action('append', { id: 'bac_fr_com_video', orgId: 'bac', previous: 'bac_fr_expense', percent: 0.1 }),
  action('append', { id: 'bac_fr_com_vod', orgId: 'bac', previous: 'bac_fr_expense', percent: 0.5 }),
  action('appendHorizontal', { id: 'bac_fr_com_svod', blameId: 'tat', previous: 'bac_fr_expense', children: [
    { type: 'right', id: 'bac_fr_com_svod_0', orgId: 'bac', percent: 0.5, conditions: and([
      condition('amount', { operator: '<', target: 20_000, blocking: true }),
    ]) },
    { type: 'right',  id: 'bac_fr_com_svod_1', orgId: 'bac', percent: 0.3, conditions: and([
      condition('amount', { operator: '>=', target: 20_000, blocking: true }),
    ]) }
  ]}),
  action('append', { id: 'bac_row_com', orgId: 'bac', previous: 'bac_row_expense', percent: 0.3 }),
  action('append', { id: 'bac_row_com_festival', orgId: 'bac', previous: 'bac_row_expense', percent: 0.5 }),


  // Rest for Producer
  action('prepend', { id: 'tat_rest', orgId: 'tat', percent: 1, next: [
    'france_tv_com',
    'master_com',
    'bac_rnpp_com',
    'lp_com',
    'lp_support'
  ] }),
  
  // Incomes
  action('income', { id: '$cnc_support', from: 'cnc_support', to: 'tat_cnc_support', amount: 218_642, territory: [], media: [] }),
  action('income', { id: '$fr_cine', from: 'fr_cine', to: 'bac_fr_com_cine', amount: 303_770, territory: [], media: [] }),
  action('income', { id: '$fr_video', from: 'fr_video', to: 'bac_fr_com_video', amount: 35_000, territory: [], media: [] }),
  action('income', { id: '$fr_ancillary', from: 'fr_ancillary', to: 'bac_fr_com_ancillary', amount: 10_000, territory: [], media: [] }),
  
  action('income', { id: '$row_all', from: 'row_all', to: 'bac_row_com', amount: 1_470_307.16, territory: [], media: [] }),
  action('income', { id: '$row_festival', from: 'row_festival', to: 'bac_row_com_festival', amount: 5_370, territory: [], media: [] }),

  action('income', { id: '$tat_music', from: 'music', to: 'rnpp', amount: 11_004.99, territory: [], media: [] })
];