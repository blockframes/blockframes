import { Injectable } from '@angular/core';
import { Store, StoreConfig } from '@datorama/akita';
import { Wallet } from '../../types';

export function createWallet(wallet: Partial<Wallet>) {
  return { ...wallet } as Wallet;
}

const initialState: Wallet = {
  ensDomain: null,
  address: null,
  hasERC1077: false,
  tx: null,
};

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'wallet' })
export class WalletStore extends Store<Wallet> {
  constructor() {
    super(initialState);
  }
}
