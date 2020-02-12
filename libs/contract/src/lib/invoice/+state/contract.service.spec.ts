import { InvoiceStore } from './invoice.store';

describe('InvoiceStore', () => {
  let store: InvoiceStore;

  beforeEach(() => {
    store = new InvoiceStore();
  });

  it('should create an instance', () => {
    expect(store).toBeTruthy();
  });

});
