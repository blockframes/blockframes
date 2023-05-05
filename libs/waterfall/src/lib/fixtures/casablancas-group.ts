import { and, condition, or } from '../conditions';
import { Action, action } from '../action';

export const actions: Action[] = [
  // CNC
  action('prepend', { id: 'cnc_com_cine_fr', next: [], orgId: 'cnc', percent: 0.0058 }),

  // Playtime //

  // TV FR
  action('prependHorizontal', {
    id: 'playtime_tv_fr',
    blameId: 'playtime',
    next: [],
    children: [
      { type: 'right', id: 'playtime_tv_fr_1', orgId: 'playtime', percent: 0.15, conditions: and([
        condition('amount', { operator: '<', target: 50_000 })
      ]) },
      { type: 'right', id: 'playtime_tv_fr_2', orgId: 'playtime', percent: 0.10, conditions: and([
        condition('amount', { operator: '>=', target: 50_000 })
      ]) }
    ]
  }),
  action('prepend', { id: 'playtime_expense_us_tv_fr', orgId: 'playtime', next: 'playtime_tv_fr', pools: ['playtime_expense_us'], percent: 1, conditions: and([
    condition('poolRevenu', { pool: 'playtime_expense_us', operator: '<', target: 7_500 }),
    condition('contractDate', { to: new Date('30/04/2017') }),
  ]) }),
  action('prepend', { id: 'playtime_expense_only_tv_fr', orgId: 'playtime', next: 'playtime_expense_us_tv_fr', percent: 1, conditions: and([
    condition('rightRevenu', { rightId: 'playtime_expense_only_tv_fr', operator: '<', target: 7_295 }),
    condition('incomeDate', { from: new Date('01/01/2018') })
  ]) }),
  action('prepend', { id: 'playtime_expense_tv_fr', orgId: 'playtime', next: 'playtime_expense_only_tv_fr', pools: ['expense'], percent: 1, conditions: and([
    condition('poolRevenu', { pool: 'expense', operator: '<', target: 37_050.37 })
  ]) }),
  action('prepend', { id: 'playtime_mg_tv_fr', orgId: 'playtime', next: 'playtime_expense_tv_fr', pools: ['mg'], percent: 0.15, conditions: and([
    condition('poolRevenu', { pool: 'mg', operator: '<', target: 50_000 })
  ]) }),

  // SVOD fr
  action('prepend', { id: 'playtime_com_svod_fr', orgId: 'playtime', next: [], percent: 0.25 }),
  action('prepend', { id: 'playtime_expense_us_svod_fr', orgId: 'playtime', next: 'playtime_com_svod_fr', pools: ['playtime_expense_us'], percent: 1, conditions: and([
    condition('poolRevenu', { pool: 'playtime_expense_us', operator: '<', target: 7_500 }),
    condition('contractDate', { to: new Date('30/04/2017') }),
  ]) }),
  action('prepend', { id: 'playtime_expense_svod_fr', orgId: 'playtime', next: 'playtime_expense_us_svod_fr', pools: ['expense'], percent: 1, conditions: and([
    condition('poolRevenu', { pool: 'expense', operator: '<', target: 37_050.37 })
  ]) }),
  action('prepend', { id: 'playtime_mg_svod_fr', orgId: 'playtime', next: 'playtime_expense_svod_fr', pools: ['mg'], percent: 0.5, conditions: and([
    condition('poolRevenu', { pool: 'mg', operator: '<', target: 50_000 })
  ]) }),

  // SVOD us
  action('prepend', { id: 'playtime_com_svod_us', orgId: 'playtime', next: [], percent: 0.1 }),
  action('prepend', { id: 'playtime_expense_us_svod_us', orgId: 'playtime', next: 'playtime_com_svod_us', pools: ['playtime_expense_us'], percent: 1, conditions: and([
    condition('poolRevenu', { pool: 'playtime_expense_us', operator: '<', target: 7_500 }),
    condition('contractDate', { to: new Date('30/04/2017') }),
  ]) }),
  action('prepend', { id: 'playtime_expense_svod_us', orgId: 'playtime', next: 'playtime_expense_us_svod_us', pools: ['expense'], percent: 1, conditions: and([
    condition('poolRevenu', { pool: 'expense', operator: '<', target: 37_050.37 })
  ]) }),
  action('prepend', { id: 'playtime_mg_svod_us', orgId: 'playtime', next: 'playtime_expense_svod_us', pools: ['mg'], percent: 0.1, conditions: and([
    condition('poolRevenu', { pool: 'mg', operator: '<', target: 50_000 })
  ]) }),

  // SVOD row
  action('prepend', { id: 'playtime_com_svod_row', orgId: 'playtime', next: [], percent: 0.15 }),
  action('prepend', { id: 'playtime_expense_us_svod_row', orgId: 'playtime', next: 'playtime_com_svod_row', pools: ['playtime_expense_us'], percent: 1, conditions: and([
    condition('poolRevenu', { pool: 'playtime_expense_us', operator: '<', target: 7_500 }),
    condition('contractDate', { to: new Date('30/04/2017') }),
  ]) }),
  action('prepend', { id: 'playtime_expense_svod_row', orgId: 'playtime', next: 'playtime_expense_us_svod_row', pools: ['expense'], percent: 1, conditions: and([
    condition('poolRevenu', { pool: 'expense', operator: '<', target: 37_050.37 })
  ]) }),
  action('prepend', { id: 'playtime_mg_svod_row', orgId: 'playtime', next: 'playtime_expense_svod_row', pools: ['mg'], percent: 0.7, conditions: and([
    condition('poolRevenu', { pool: 'mg', operator: '<', target: 50_000 })
  ]) }),

  // festival
  action('prepend', { id: 'playtime_com_festival', orgId: 'playtime', next: [], percent: 0.5 }),
  action('prepend', { id: 'playtime_expense_us_festival', orgId: 'playtime', next: 'playtime_com_festival', pools: ['playtime_expense_us'], percent: 1, conditions: and([
    condition('poolRevenu', { pool: 'playtime_expense_us', operator: '<', target: 7_500 }),
    condition('contractDate', { to: new Date('30/04/2017') }),
  ]) }),
  action('prepend', { id: 'playtime_expense_festival', orgId: 'playtime', next: 'playtime_expense_us_festival', pools: ['expense'], percent: 1, conditions: and([
    condition('poolRevenu', { pool: 'expense', operator: '<', target: 37_050.37 })
  ]) }),
  action('prepend', { id: 'playtime_mg_festival', orgId: 'playtime', next: 'playtime_expense_festival', pools: ['mg'], percent: 1, conditions: and([
    condition('poolRevenu', { pool: 'mg', operator: '<', target: 50_000 })
  ]) }),


  // all row (all without svod & festival)
  action('prepend', { id: 'playtime_com_all_row', orgId: 'playtime', next: [], percent: 0.25 }),
  action('prepend', { id: 'playtime_expense_us_all_row', orgId: 'playtime', next: 'playtime_com_all_row', pools: ['playtime_expense_us'], percent: 1, conditions: and([
    condition('poolRevenu', { pool: 'playtime_expense_us', operator: '<', target: 7_500 }),
    condition('contractDate', { to: new Date('30/04/2017') }),
  ]) }),
  action('prepend', { id: 'playtime_expense_all_row', orgId: 'playtime', next: 'playtime_expense_us_all_row', pools: ['expense'], percent: 1, conditions: and([
    condition('poolRevenu', { pool: 'expense', operator: '<', target: 37_050.37 })
  ]) }),
  action('prepend', { id: 'playtime_mg_all_row', orgId: 'playtime', next: 'playtime_expense_all_row', pools: ['mg'], percent: 0.7, conditions: and([
    condition('poolRevenu', { pool: 'mg', operator: '<', target: 50_000 })
  ]) }),


  // Netflix condition
  action('prepend', { id: 'playtime_netflix_us', orgId: 'playtime', next: ['playtime_mg_tv_fr', 'playtime_mg_svod_fr', 'playtime_mg_festival', 'playtime_mg_all_row'], percent: 1, conditions: and([
    condition('rightTurnover', { rightId: 'playtime_netflix_us', operator: '<', target: { id: 'playtime_com_svod_us', percent: 0.15, in: 'rights.turnover'} })
  ]) }),
  action('prepend', { id: 'playtime_netflix_row', orgId: 'playtime', next: ['playtime_netflix_us'], percent: 1, conditions: and([
    condition('rightTurnover', { rightId: 'playtime_netflix_row', operator: '<', target: { id: 'playtime_com_svod_us', percent: 0.1, in: 'rights.turnover'} })
  ]) }),



  /// UFO ///
  action('prepend', { id: 'ufo_cine_fr', orgId: 'ufo', next: [], percent: 0.25 }),
  action('prepend', { id: 'ufo_dvd_fr', orgId: 'ufo', next: [], percent: 0.75 }),
  action('prepend', { id: 'ufo_vod_fr', orgId: 'ufo', next: [], percent: 0.35 }),
  action('prepend', { id: 'ufo_expense', orgId: 'ufo', next: ['ufo_cine_fr', 'ufo_dvd_fr', 'ufo_vod_fr'], percent: 1, conditions: and([
    condition('rightRevenu', { rightId: 'ufo_expense', operator: '<', target: 88_500 })
  ])}),
  action('prepend', { id: 'ufo_mg', orgId: 'ufo', next: 'ufo_expense', percent: 1, conditions: and([
    condition('rightRevenu', { rightId: 'ufo_mg', operator: '<', target: 30_000 })
  ])}),


  /// Soficinema ///
  action('prependVertical', {
    id: 'soficinema_rnpp_cine_fr',
    next: ['ufo_mg'],
    children: [
      { type: 'right', id: 'soficinema_rnpp_cine_fr_1', orgId: 'soficinema', percent: 0.3, conditions: and([
        condition('orgRevenu', { orgId: 'soficinema', operator: '<', target: 115_000 }),
        condition('terms', { type: 'territory', operator: 'in', list: ['france'] }),
        condition('terms', { type: 'media', operator: 'in', list: ['cine'] }),
      ]) },
      { type: 'right', id: 'soficinema_rnpp_cine_fr_2', orgId: 'soficinema', percent: 0.1, conditions: and([
        condition('orgRevenu', { orgId: 'soficinema', operator: '<', target: 165_000 }),
        condition('terms', { type: 'territory', operator: 'in', list: ['france'] }),
        condition('terms', { type: 'media', operator: 'in', list: ['cine'] }),
      ]) },
      { type: 'right', id: 'soficinema_rnpp_cine_fr_3', orgId: 'soficinema', percent: 0.04, conditions: and([
        condition('terms', { type: 'territory', operator: 'in', list: ['france'] }),
        condition('terms', { type: 'media', operator: 'in', list: ['cine'] }),
      ]) }
    ]
  }),
  action('prependVertical', {
    id: 'soficinema_rnpp_video_fr',
    next: ['ufo_mg'],
    children: [
      { type: 'right', id: 'soficinema_rnpp_video_fr_1', orgId: 'soficinema', percent: 0.3, conditions: and([
        condition('orgRevenu', { orgId: 'soficinema', operator: '<', target: 115_000 })
      ]) },
      { type: 'right', id: 'soficinema_rnpp_video_fr_2', orgId: 'soficinema', percent: 0.1, conditions: and([
        condition('orgRevenu', { orgId: 'soficinema', operator: '<', target: 165_000 })
      ]) },
      { type: 'right', id: 'soficinema_rnpp_video_fr_3', orgId: 'soficinema', percent: 0.04 }
    ]
  })
];