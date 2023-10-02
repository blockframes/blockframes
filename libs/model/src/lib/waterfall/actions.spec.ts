import { waterfall } from '@blockframes/waterfall/main';
import { Action, action } from './action';

describe('Test standalone actions', () => {
  it('orgRevenu', () => {
    const actions: Action[] = [
      action('append', { id: 'seller', orgId: 'seller', percent: 0.5, previous: [] }),
      action('income', { id: 'income', amount: 10_000, medias: [], territories: [], from: 'income', to: 'seller' })
    ];

    const { state } = waterfall('foo-title', actions);
    const { orgs } = state;

    expect(orgs['seller'].revenu.calculated).toEqual(5_000);
  });

  it('orgTurnover', () => {
    const actions: Action[] = [
      action('append', { id: 'seller', orgId: 'seller', percent: 0.5, previous: [] }),
      action('income', { id: 'income', amount: 10_000, medias: [], territories: [], from: 'income', to: 'seller' })
    ];

    const { state } = waterfall('foo-title', actions);
    const { orgs } = state;

    expect(orgs['seller'].turnover.calculated).toEqual(10_000);
  });

  describe('poolRevenu', () => {
    it('with regular rights', () => {
      const actions: Action[] = [
        action('append', { id: 'seller-1', orgId: 'seller-1', percent: 0.5, pools: ['seller-1-2'], previous: ['seller-2'] }),
        action('append', { id: 'seller-2', orgId: 'seller-2', percent: 0.5, pools: ['seller-1-2'], previous: [] }),
        action('income', { id: 'income', amount: 10_000, medias: [], territories: [], from: 'income', to: 'seller-1' })
      ];

      const { state } = waterfall('foo-title', actions);
      const { pools } = state;

      expect(pools['seller-1-2'].revenu.calculated).toEqual(7_500);
    });

    it('with horizontal group', () => {
      const actions: Action[] = [
        action('appendHorizontal', {
          id: 'seller-group', blameId: 'seller-1', previous: [], children: [
            { type: 'right', id: 'seller-1', orgId: 'seller-1', percent: 0.5, pools: ['seller-1-2'] },
            { type: 'right', id: 'seller-2', orgId: 'seller-2', percent: 0.25, pools: ['seller-1-2'] }
          ]
        }),
        action('income', { id: 'income', amount: 10_000, medias: [], territories: [], from: 'income', to: 'seller-group' })
      ];

      const { state } = waterfall('foo-title', actions);
      const { pools } = state;

      expect(pools['seller-1-2'].revenu.calculated).toEqual(7_500);
    });
  });

  describe('poolTurnover', () => {
    it('with regular rights', () => {
      const actions: Action[] = [
        action('append', { id: 'seller-1', orgId: 'seller-1', percent: 0.5, pools: ['seller-1-2'], previous: ['seller-2'] }),
        action('append', { id: 'seller-2', orgId: 'seller-2', percent: 0.5, pools: ['seller-1-2'], previous: [] }),
        action('income', { id: 'income', amount: 10_000, medias: [], territories: [], from: 'income', to: 'seller-1' })
      ];

      const { state } = waterfall('foo-title', actions);
      const { pools } = state;

      expect(pools['seller-1-2'].turnover.calculated).toEqual(10_000);
    });

    it('with horizontal group', () => {
      const actions: Action[] = [
        action('appendHorizontal', {
          id: 'seller-group', blameId: 'seller-1', previous: [], children: [
            { type: 'right', id: 'seller-1', orgId: 'seller-1', percent: 0.5, pools: ['seller-1-2'] },
            { type: 'right', id: 'seller-2', orgId: 'seller-2', percent: 0.5, pools: ['seller-1-2'] }
          ]
        }),
        action('income', { id: 'income', amount: 10_000, medias: [], territories: [], from: 'income', to: 'seller-group' })
      ];

      const { state } = waterfall('foo-title', actions);
      const { pools } = state;

      expect(pools['seller-1-2'].turnover.calculated).toEqual(10_000);
    });
  });

  it('rightRevenu', () => {
    const actions: Action[] = [
      action('append', { id: 'seller-1', orgId: 'seller-1', percent: 0.5, previous: ['seller-2'] }),
      action('append', { id: 'seller-2', orgId: 'seller-2', percent: 0.5, previous: [] }),
      action('income', { id: 'income', amount: 10_000, medias: [], territories: [], from: 'income', to: 'seller-1' })
    ];

    const { state } = waterfall('foo-title', actions);
    const { rights } = state;

    expect(rights['seller-1'].revenu.calculated).toEqual(5_000);
    expect(rights['seller-2'].revenu.calculated).toEqual(2_500);
  });

})
