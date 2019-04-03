import { IRelayer } from './relayer';
import { providers, utils } from 'ethers';

export class MockRelayer implements IRelayer {
  async create(name: string, key: string) {
    return { message: 'mock erc1077 created' };
  }
  async prepare(name: string) {
    return { message: 'mock erc1077 prepare' };
  }
  async send(
    name: string,
    tx: providers.TransactionRequest
  ): Promise<providers.TransactionResponse> {
    const receipt: providers.TransactionReceipt = {
      byzantium: false
    };
    return {
      confirmations: 0,
      from: '0x0',
      wait: async () => receipt,
      nonce: 0,
      gasLimit: new utils.BigNumber(0),
      gasPrice: new utils.BigNumber(0),
      data: '0x0',
      value: new utils.BigNumber(0),
      chainId: 0
    };
  }
  async addKey(name: string, key: string) {
    return { message: 'mock erc1077 addKey' };
  }
  async removeKey(name: string, key: string) {
    return { message: 'mock erc1077 removeKey' };
  }
}

describe('MockRelayer', () => {
  test('smoke', () => {
    expect(true).toBeTruthy();
  });
});
