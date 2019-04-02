import { MetaTransaction } from '../erc1077/meta-transaction';
import { Injectable } from '@angular/core';
import { providers } from 'ethers';
import { BigNumber } from 'ethers/utils';

export interface IRelayer {
  create: (name: string, key: string) => Promise<Object>;

  prepare: (name: string) => Promise<Object>;

  send: (name: string, tx: providers.TransactionRequest) => Promise<providers.TransactionResponse>;

  addKey: (name: string, key: string) => Promise<Object>;

  removeKey: (name: string, key: string) => Promise<Object>;
}

@Injectable({ providedIn: 'root' })
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
      gasLimit: new BigNumber(0),
      gasPrice: new BigNumber(0),
      data: '0x0',
      value: new BigNumber(0),
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
