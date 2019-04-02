import { network } from '@env';
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
    const ethNetwork = await provider.getNetwork();
    expect(ethNetwork.name).toBe(network);
    expect(blockNum).toBeGreaterThan(5000000);
  });
});
