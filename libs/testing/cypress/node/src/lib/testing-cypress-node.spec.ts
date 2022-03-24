import { testingCypressNode } from './testing-cypress-node';

describe('testingCypressNode', () => {
  it('should work', () => {
    expect(testingCypressNode()).toEqual('testing-cypress-node');
  });
});
