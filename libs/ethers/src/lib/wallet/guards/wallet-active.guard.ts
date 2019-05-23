import { Injectable } from '@angular/core';
import { FireQuery, Query } from '@blockframes/utils';
import { Wallet, WalletStore } from "../+state";
import { Router, UrlTree, CanActivate, CanDeactivate } from "@angular/router";
import { Subscription } from 'rxjs';
import { map, tap, switchMap } from 'rxjs/operators';
import { applyTransaction } from '@datorama/akita';
import { User } from '@blockframes/auth';
import { AngularFireAuth } from '@angular/fire/auth';

export const UserQuery = (uid: string): Query<User> => ({
  path: `users/${uid}`
});

@Injectable({ providedIn: 'root' })
export class WalletActiveGuard implements CanActivate, CanDeactivate<Wallet> {

  urlFallback = 'layout/account';
  subscription: Subscription;

  constructor(
    private afAuth: AngularFireAuth,
    private fireQuery: FireQuery,
    private store: WalletStore,
    private router: Router,
  ) {}

  query() {
    return this.afAuth.authState.pipe(
      switchMap(user => {
        const query = UserQuery(user.uid)
        return this.fireQuery.fromQuery<User>(query);
      })
    );
  }

  canActivate(): Promise<boolean | UrlTree> | UrlTree {
    return new Promise((res, rej) => {
      this.subscription = this.query().pipe(
        tap(user => applyTransaction(() => {
          if (user.identity) {
            this.store.update({exist: true, ensDomain: user.identity.domain, address: user.identity.address});
          }
          this.store.setLoading(false);
        }))
      ).subscribe({
        next: result => res(!!result),
        error: err => res(this.router.parseUrl(this.urlFallback))
      });
    })
  }

  canDeactivate() {
    this.subscription.unsubscribe();
    return true;
  }

}