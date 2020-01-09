import { Injectable } from '@angular/core';
import { WalletService } from "../+state";
import { Router, UrlTree, CanActivate, CanDeactivate } from "@angular/router";
import { Subscription } from 'rxjs';
import { tap, filter } from 'rxjs/operators';
import { AuthQuery } from '@blockframes/auth';
import { Wallet } from '../../types';

@Injectable({ providedIn: 'root' })
export class WalletActiveGuard implements CanActivate, CanDeactivate<Wallet> {

  urlFallback = 'c/o/account';
  subscription: Subscription;

  constructor(
    private authQuery: AuthQuery,
    private walletService: WalletService,
    private router: Router,
  ) {}

  canActivate(): Promise<boolean | UrlTree> | UrlTree {
    return new Promise((res, rej) => {
      this.subscription = this.authQuery.user$.pipe(
        filter(user => !!user),
        tap(async user => {
          await this.walletService.updateFromEmail(user.email);
          try {
            await this.walletService.checkWallet();
          } catch (error) {
            rej(error);
          }
        })
      ).subscribe({
        next: result => res(!!result),
        error: err => res(this.router.parseUrl(this.urlFallback))
      });
    });
  }

  canDeactivate() {
    this.subscription.unsubscribe();
    return true;
  }
}
