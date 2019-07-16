import { Injectable } from '@angular/core';
import { WalletQuery } from "../+state";
import { Router, UrlTree, CanActivate } from "@angular/router";
import { KeyManagerQuery } from '../../key-manager/+state';

@Injectable({ providedIn: 'root' })
export class WalletKeyGuard implements CanActivate {

  constructor(
    private walletQuery: WalletQuery,
    private keyQuery: KeyManagerQuery,
    private router: Router,
  ) {}

  canActivate(): boolean | UrlTree {
    const { ensDomain } = this.walletQuery.getValue();
    const count = this.keyQuery.getKeyCountOfUser(ensDomain);
    if (count === 0) {
      return this.router.parseUrl('layout/o/account/wallet/add');
    }
    return true;
  }
}