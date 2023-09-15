import { waterfall } from '@blockframes/waterfall/main';
import { Action, action } from './action';
import { and, condition } from './conditions';

describe('Test standalone conditions', () => {
  describe('ContractAmount', () => {
    it('ContractAmout with target > amount', () => {
      const actions: Action[] = [
        action('contract', { id: 'contract', amount: 50_000, date: new Date() }),
        action('append', { id: 'seller', orgId: 'seller', percent: 1, previous: [], conditions: and([condition('contractAmount', { operator: '>=', target: 50_001 })]) }),
        action('income', { id: 'income', contractId: 'contract', amount: 10_000, medias: [], territories: [], from: 'income', to: 'seller' })
      ];

      const { state } = waterfall('foo-title', actions);
      const { orgs } = state;

      expect(orgs['seller'].revenu.calculated).toEqual(0);
    });

    it('ContractAmout with target < amount', () => {
      const actions: Action[] = [
        action('contract', { id: 'contract', amount: 50_000, date: new Date() }),
        action('append', { id: 'seller', orgId: 'seller', percent: 1, previous: [], conditions: and([condition('contractAmount', { operator: '>=', target: 49_999 })]) }),
        action('income', { id: 'income', contractId: 'contract', amount: 10_000, medias: [], territories: [], from: 'income', to: 'seller' })
      ];

      const { state } = waterfall('foo-title', actions);
      const { orgs } = state;

      expect(orgs['seller'].revenu.calculated).toEqual(10_000);
    });

    it('ContractAmout with target == amount', () => {
      const actions: Action[] = [
        action('contract', { id: 'contract', amount: 50_000, date: new Date() }),
        action('append', { id: 'seller', orgId: 'seller', percent: 1, previous: [], conditions: and([condition('contractAmount', { operator: '>=', target: 50_000 })]) }),
        action('income', { id: 'income', contractId: 'contract', amount: 10_000, medias: [], territories: [], from: 'income', to: 'seller' })
      ];

      const { state } = waterfall('foo-title', actions);
      const { orgs } = state;

      expect(orgs['seller'].revenu.calculated).toEqual(10_000);
    });
  });
  describe('poolShadowRevenu', () => {
    it('without other condition', () => {
      const actions: Action[] = [
        action('append', {
          id: 'mg-author', orgId: 'author', percent: 0.01, previous: [], pools: ['pool-a'],  conditions: and([
            condition('poolShadowRevenu', { pool: 'pool-a', operator: '>=', target: 10_000 }),
          ])
        }),

        action('income', { id: 'income', amount: 1_000_100, from: 'row_all', to: 'mg-author', territories: [], medias: [] }),
      ];

      const { state } = waterfall('foo-title', actions);
      const { pools } = state;

      expect(pools['pool-a'].shadowRevenu).toEqual(10_001);
      expect(pools['pool-a'].revenu.calculated).toEqual(1);
      expect(pools['pool-a'].turnover.calculated).toEqual(1_000_100);
    });

    it('with other matching conditions', () => {
      const actions: Action[] = [
        action('append', {
          id: 'mg-author', orgId: 'author', percent: 0.01, previous: [], pools: ['pool-a'],  conditions: and([
            condition('poolShadowRevenu', { pool: 'pool-a', operator: '>=', target: 10_000 }),
            condition('terms', { type: 'territories', operator: 'in', list: ['france'] })
          ])
        }),

        action('income', { id: 'income', amount: 1_000_100, from: 'france_all', to: 'mg-author', territories: ['france'], medias: [] }),
      ];

      const { state } = waterfall('foo-title', actions);
      const { pools } = state;

      expect(pools['pool-a'].shadowRevenu).toEqual(10_001);
      expect(pools['pool-a'].revenu.calculated).toEqual(1);
      expect(pools['pool-a'].turnover.calculated).toEqual(1_000_100);
    });

    it('with other non-matching conditions', () => {
      const actions: Action[] = [
        action('append', {
          id: 'mg-author', orgId: 'author', percent: 0.01, previous: [], pools: ['pool-a'],  conditions: and([
            condition('poolShadowRevenu', { pool: 'pool-a', operator: '>=', target: 10_000 }),
            condition('terms', { type: 'territories', operator: 'not-in', list: ['france'] })
          ])
        }),

        action('income', { id: 'income', amount: 1_000_100, from: 'france_all', to: 'mg-author', territories: ['france'], medias: [] }),
      ];

      const { state } = waterfall('foo-title', actions);
      const { pools } = state;

      expect(pools['pool-a'].shadowRevenu).toEqual(0);
      expect(pools['pool-a'].revenu.calculated).toEqual(0);
      expect(pools['pool-a'].turnover.calculated).toEqual(1_000_100);
    });

    it('with many rights pointing to same pool', () => {
      const actions: Action[] = [
        action('append', {
          id: 'mg-author-1', orgId: 'author-1', percent: 0.01, previous: [], pools: ['pool-a'],  conditions: and([
            condition('poolShadowRevenu', { pool: 'pool-a', operator: '>=', target: 10_000 }),
          ])
        }),
        action('append', {
          id: 'mg-author-2', orgId: 'author-2', percent: 0.01, previous: [], pools: ['pool-a'],  conditions: and([
            condition('poolShadowRevenu', { pool: 'pool-a', operator: '>=', target: 500 }),
          ])
        }),
        action('income', { id: 'income-1', amount: 1_000_100, from: 'row_all', to: 'mg-author-1', territories: [], medias: [] }),
        action('income', { id: 'income-2', amount: 1_000, from: 'row_all', to: 'mg-author-2', territories: [], medias: [] }),
      ];

      const { state } = waterfall('foo-title', actions);
      const { pools } = state;

      expect(pools['pool-a'].shadowRevenu).toEqual(10_011);
      expect(pools['pool-a'].revenu.calculated).toEqual(11);
      expect(pools['pool-a'].turnover.calculated).toEqual(1_001_100);
    });

  });
})
