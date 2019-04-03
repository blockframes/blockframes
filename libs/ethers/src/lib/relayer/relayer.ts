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

