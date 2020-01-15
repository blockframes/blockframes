import { ContractVersionStore } from './contract-version.store';

describe('ContractVersionStore', () => {
  let store: ContractVersionStore;

  beforeEach(() => {
    store = new ContractVersionStore();
  });

  it('should create an instance', () => {
    expect(store).toBeTruthy();
  });

});
