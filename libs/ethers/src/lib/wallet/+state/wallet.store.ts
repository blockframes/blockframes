import { Injectable } from '@angular/core';
import { Store, StoreConfig } from '@datorama/akita';

export interface Wallet {
  exist: boolean,
  domain: string,
  address: string
  balance: string;
}

export function createWallet(wallet: Partial<Wallet>) {
  return { ...wallet } as Wallet;
}

const initialState: Wallet = {
  exist: false,
  domain: null,
  address: null,
  balance: '0.0',
}

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'wallet' })
export class WalletStore extends Store<Wallet> {
  constructor() {
    super(initialState);
  }
}
