import { Injectable } from '@angular/core';
import { WalletQuery } from "../+state";
import { Router, UrlTree, CanActivate, CanDeactivate } from "@angular/router";
import { Wallet } from '../../types';

@Injectable({ providedIn: 'root' })
export class WalletTxGuard implements CanActivate, CanDeactivate<Wallet> {

  urlFallback = 'c/o/account/wallet';

  constructor(
    private query: WalletQuery,
    private router: Router,
  ) {}

  /**
   * Accessing /wallet/send without a tx will cause an error,
   * so if no tx is present in the state (ex: direct url access),
   * we redirect to the wallet page
   */
  canActivate(): Promise<boolean | UrlTree> | UrlTree {
    return new Promise((res, rej) => {
      const tx = this.query.getValue().tx;
      if (!!tx) {
        res(true);
      } else {
        res(this.router.parseUrl(this.urlFallback));
      }
    });
  }

  canDeactivate() {
    return true;
  }
}
