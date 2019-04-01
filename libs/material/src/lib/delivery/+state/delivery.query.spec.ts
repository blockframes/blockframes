import { DeliveryQuery } from './delivery.query';
import { DeliveryStore } from './delivery.store';

describe('DeliveryQuery', () => {
  let query: DeliveryQuery;

  beforeEach(() => {
    query = new DeliveryQuery(new DeliveryStore);
  });

  it('should create an instance', () => {
    expect(query).toBeTruthy();
  });

});
