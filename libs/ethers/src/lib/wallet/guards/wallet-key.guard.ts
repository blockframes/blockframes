import { Injectable } from '@angular/core';
import { WalletQuery } from "../+state";
import { Router, UrlTree, CanActivate } from "@angular/router";
import { KeyManagerQuery } from '../../key-manager/+state';
import { filter, switchMap } from 'rxjs/operators';
import { Subscription } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class WalletKeyGuard implements CanActivate {

  urlFallback = 'c/o/account/wallet/no-key';
  subscription: Subscription;

  constructor(
    private walletQuery: WalletQuery,
    private keyQuery: KeyManagerQuery,
    private router: Router,
  ) {}

  canActivate(): Promise<boolean | UrlTree> | UrlTree {
    return new Promise(async (res, rej) => {
      this.subscription = this.keyQuery.selectLoading().pipe(
        filter(loading => !loading), // ensure keys are retrieved from local storage
        switchMap(() => this.walletQuery.select()),
        filter(wallet => !!wallet.ensDomain), // ensure that wallet has ensDomain value
      ).subscribe({
        next: wallet => {
          const count = this.keyQuery.getKeyCountOfUser(wallet.ensDomain); // get key count for this user (ensDomain)
          if (count === 0) {
            res(this.router.parseUrl(this.urlFallback));
          }
          res(true);
        },
        error: () => res(this.router.parseUrl(this.urlFallback))
      });
    });
  }

  canDeactivate() {
    this.subscription.unsubscribe();
    return true;
  }
}