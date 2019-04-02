import { Provider } from './provider';

describe('Provider', () => {
  let provider: Provider;

  beforeAll(() => {
    provider = new Provider();
  });

  test('should exist', () => {
    expect(provider).toBeDefined();
  });

  test('should be connected to Ropsten', async () => {
    const blockNum = await provider.getBlockNumber();
    const network = await provider.getNetwork();
    expect(network.name).toBe('ropsten');
    expect(blockNum).toBeGreaterThan(5000000);
  });
});
