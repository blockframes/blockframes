import { and, condition, Action, action } from '@blockframes/model';

export const actions: Action[] = [
  // RNPP
  action('appendHorizontal', {
    id: 'RNPP',
    blameId: 'TAT',
    previous: [],
    children: [
      // Logical Pictures
      {
        type: 'vertical',
        id: 'RNPP Logical Pictures',
        children: [
          {
            type: 'right',
            id: 'LP - Palier 1',
            orgId: 'Logical Pictures',
            percent: 0.55,
            conditions: and([condition('poolRevenu', { pool: 'bac_coprod', operator: '<', target: 50_000 })]),
          },
          {
            type: 'right',
            id: 'LP - Palier 2',
            orgId: 'Logical Pictures',
            percent: 0.6,
            conditions: and([condition('orgRevenu', { orgId: 'Logical Pictures', operator: '<', target: 360_000 })]),
          },
          { type: 'right', id: 'LP - Palier 3', orgId: 'Logical Pictures', percent: 0.15 },
        ],
      },
      // France TV
      {
        type: 'vertical',
        id: 'RNPP France TV',
        children: [
          {
            type: 'right',
            id: 'FTV - Palier 1',
            orgId: 'France TV',
            percent: 0.1,
            conditions: and([condition('orgRevenu', { orgId: 'France TV', operator: '<', target: 160_000 })]),
          },
          { type: 'right', id: 'FTV - Palier 2', orgId: 'France TV', percent: 0.07 },
        ],
      },
      // Bac
      {
        type: 'vertical',
        id: 'RNPP BAC (copro)',
        children: [
          {
            type: 'right',
            id: 'BAC - Palier 1',
            orgId: 'BAC',
            percent: 0.2,
            pools: ['bac_coprod'],
            conditions: and([condition('poolRevenu', { pool: 'bac_coprod', operator: '<', target: 50_000 })]),
          },
          { type: 'right', id: 'BAC - Palier 2', orgId: 'BAC', percent: 0.15, pools: ['bac_coprod'] },
        ],
      },
      // Master
      { type: 'right', id: 'Master Films', orgId: 'Master Films', percent: 0.05 },
    ],
  }),

  // Seller
  action('append', {
    id: 'MG BAC',
    orgId: 'BAC',
    previous: 'RNPP',
    percent: 1,
    conditions: and([condition('rightRevenu', { rightId: 'MG BAC', operator: '<', target: 1_150_000 })]),
  }),
  action('append', {
    id: 'Frais France BAC',
    orgId: 'BAC',
    previous: 'MG BAC',
    percent: 1,
    conditions: and([condition('rightRevenu', { rightId: 'Frais France BAC', operator: '<', target: 738_127 })]),
  }),
  action('append', {
    id: 'Frais Inter BAC',
    orgId: 'BAC',
    previous: 'MG BAC',
    percent: 1,
    conditions: and([condition('rightRevenu', { rightId: 'Frais Inter BAC', operator: '<', target: 80_000 })]),
  }),
  action('append', { id: 'Commission Ancillaires FR', orgId: 'BAC', previous: 'Frais France BAC', percent: 0.5 }),
  action('append', { id: 'Commission Salles FR', orgId: 'BAC', previous: 'Frais France BAC', percent: 0.3 }),
  action('append', { id: 'Commission Vidéo FR', orgId: 'BAC', previous: 'Frais France BAC', percent: 0.1 }),
  action('append', { id: 'Commission Inter', orgId: 'BAC', previous: 'Frais Inter BAC', percent: 0.3 }),
  action('append', { id: 'Commission Festivals', orgId: 'BAC', previous: 'Frais Inter BAC', percent: 0.5 }),

  // Rest for Producer
  action('prepend', { id: 'Recettes résiduelles - TAT', orgId: 'TAT', percent: 1, next: ['RNPP'] }),

  // Incomes
  action('income', { id: '$fr_cine', from: 'Salles France', to: 'Commission Salles FR', amount: 3_003_770, territories: [], medias: [] }),
  action('income', { id: '$fr_video', from: 'Vidéo France', to: 'Commission Vidéo FR', amount: 350_000, territories: [], medias: [] }),
  action('income', {
    id: '$fr_ancillary',
    from: 'Droits Ancillaires FR',
    to: 'Commission Ancillaires FR',
    amount: 100_000,
    territories: [],
    medias: [],
  }),

  action('income', { id: '$row_all', from: 'Recettes Inter', to: 'Commission Inter', amount: 2_470_000, territories: [], medias: [] }),
  action('income', {
    id: '$row_festival',
    from: 'Recettes Festivals',
    to: 'Commission Festivals',
    amount: 50_370,
    territories: [],
    medias: [],
  }),

  action('income', { id: '$tat_music', from: 'Droits musicaux', to: 'RNPP', amount: 110_000, territories: [], medias: [] }),
];