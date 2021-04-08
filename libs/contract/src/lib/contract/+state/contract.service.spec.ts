import { ContractStore } from './contract.store';

describe.skip('ContractStore', () => {
  let store: ContractStore;

  beforeEach(() => {
    store = new ContractStore();
  });

  it('should create an instance', () => {
    expect(store).toBeTruthy();
  });

});
