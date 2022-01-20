import { Injectable } from '@angular/core';
import { OrganizationService, OrganizationState } from '../+state';
import { Router } from '@angular/router';
import { CollectionGuard, CollectionGuardConfig } from 'akita-ng-fire';
import { map, switchMap } from 'rxjs/operators';
import { AuthQuery } from '@blockframes/auth/+state/auth.query';
import { combineLatest, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
@CollectionGuardConfig({ awaitSync: true })
export class OrganizationGuard extends CollectionGuard<OrganizationState> {
  constructor(
    protected service: OrganizationService,
    protected router: Router,
    private authQuery: AuthQuery
  ) {
    super(service);
  }

  sync() { // @TODO #7284 transform into canActivate
    return this.authQuery.user$.pipe(
      switchMap(user => {
        if (!user) {
          return of('/');
        }
        if (!user.orgId) {
          return of('/auth/identity');
        } else {
          return combineLatest([
            this.service.syncActive({ id: user.orgId }), // @TODO #7284 #7273 remove useless
            this.service.org$
          ]).pipe(
            map(([_, org]) => {
              if (!org) {
                return '/auth/identity';
              }
              if (org.status !== 'accepted') {
                return '/c/organization/create-congratulations';
              }
            })
          );
        }
      })
    );
  }
}
