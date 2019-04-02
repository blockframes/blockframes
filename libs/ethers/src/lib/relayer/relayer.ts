import { MetaTransaction } from '../erc1077/meta-transaction';
import { Injectable } from '@angular/core';

export interface IRelayer {
  create: (name: string, key: string) => Promise<Object>;

  prepare: (name: string) => Promise<Object>;

  send: (name: string, tx: MetaTransaction) => Promise<Object>;

  addKey: (name: string, key: string) => Promise<Object>;

  removeKey: (name: string, key: string) => Promise<Object>;
}

@Injectable({ providedIn: 'root' })
export class Relayer implements IRelayer {
  async create(name: string, key: string) {
    return { message: `mock erc1077 created` };
  }
  async prepare(name: string) {
    return { message: `mock erc1077 prepare` };
  }
  async send(name: string, tx: MetaTransaction) {
    return { message: `mock erc1077 send` };
  }
  async addKey(name: string, key: string) {
    return { message: `mock erc1077 addKey` };
  }
  async removeKey(name: string, key: string) {
    return { message: `mock erc1077 removeKey` };
  }
}
