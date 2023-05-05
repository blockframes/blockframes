import { waterfall } from './main';
import { Action, action } from './action';
import { and, condition } from './conditions';

describe('Test standalone conditions', () => {
  describe('ContractAmount', () => {
    it('ContractAmout with target > amount', () => {
      const actions: Action[] = [
        action('contract', { id: 'contract', amount: 50_000, date: new Date() }),
        action('append', { id: 'seller', orgId: 'seller', percent: 1, previous: [], conditions: and([condition('contractAmount', { operator: '>=', target: 50_001 })]) }),
        action('income', { id: 'income', contractId: 'contract', amount: 10_000, media: [], territory: [], from: 'income', to: 'seller' })
      ];

      const { state } = waterfall('foo-title', actions);
      const { orgs } = state;

      expect(orgs['seller'].revenu).toEqual(0);
    });

    it('ContractAmout with target < amount', () => {
      const actions: Action[] = [
        action('contract', { id: 'contract', amount: 50_000, date: new Date() }),
        action('append', { id: 'seller', orgId: 'seller', percent: 1, previous: [], conditions: and([condition('contractAmount', { operator: '>=', target: 49_999 })]) }),
        action('income', { id: 'income', contractId: 'contract', amount: 10_000, media: [], territory: [], from: 'income', to: 'seller' })
      ];

      const { state } = waterfall('foo-title', actions);
      const { orgs } = state;

      expect(orgs['seller'].revenu).toEqual(10_000);
    });

    it('ContractAmout with target == amount', () => {
      const actions: Action[] = [
        action('contract', { id: 'contract', amount: 50_000, date: new Date() }),
        action('append', { id: 'seller', orgId: 'seller', percent: 1, previous: [], conditions: and([condition('contractAmount', { operator: '>=', target: 50_000 })]) }),
        action('income', { id: 'income', contractId: 'contract', amount: 10_000, media: [], territory: [], from: 'income', to: 'seller' })
      ];

      const { state } = waterfall('foo-title', actions);
      const { orgs } = state;

      expect(orgs['seller'].revenu).toEqual(10_000);
    });
  });
})
