import { waterfall } from '../../main';
import { actions } from './blame-example';

describe('Test blame functionality', () => {
  it('check bonus values', () => {
    const { state } = waterfall('blame-test', actions);
    const { bonuses, orgs } = state;

    expect(Math.round(bonuses['income-1-horizontal-group'].amount)).toEqual(-2000);
    expect(bonuses['income-1-horizontal-group'].orgId).toEqual('evil-production');
    expect(Math.round(bonuses['income-1-horizontal-group-2'].amount)).toEqual(-1000);
    expect(Math.round(orgs['evil-production'].bonus)).toEqual(-3000);
  });
})
