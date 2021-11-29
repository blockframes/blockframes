import { testingCypress } from './testing-cypress';

describe('testingCypress', () => {
  it('should work', () => {
    expect(testingCypress()).toEqual('testing-cypress');
  });
});
