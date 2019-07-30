import { Injectable } from '@angular/core';
import { Query } from '@datorama/akita';
import { WalletStore } from './wallet.store';
import { Wallet } from '../../types';

@Injectable({ providedIn: 'root' })
export class WalletQuery extends Query<Wallet> {
  constructor(protected store: WalletStore) {
    super(store);
  }
}
