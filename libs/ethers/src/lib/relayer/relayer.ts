import { MetaTransaction } from '../erc1077/meta-transaction';

export interface Relayer {
  create: (name: string, key: string) => Promise<Object>;

  prepare: (name: string) => Promise<Object>;

  send: (name: string, tx: MetaTransaction) => Promise<Object>;

  addKey: (name: string, key: string) => Promise<Object>;

  removeKey: (name: string, key: string) => Promise<Object>;
}
