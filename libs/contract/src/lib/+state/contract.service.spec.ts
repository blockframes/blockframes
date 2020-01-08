import { ContractStore } from './contract.store';

describe('ContractStore', () => {
  let store: ContractStore;

  beforeEach(() => {
    store = new ContractStore();
  });

  it('should create an instance', () => {
    expect(store).toBeTruthy();
  });

});
