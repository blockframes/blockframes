import { CartState } from '../distribution-deal/+state/cart.store';
import { Injectable } from '@angular/core';
import { CollectionGuard, CollectionGuardConfig } from 'akita-ng-fire';
import { CartService } from '../distribution-deal/+state/cart.service';
import { OrganizationQuery } from '@blockframes/organization';
import { switchMap } from 'rxjs/internal/operators/switchMap';

@Injectable({ providedIn: 'root' })
@CollectionGuardConfig({ awaitSync: true })
export class CatalogCartGuard extends CollectionGuard<CartState> {
  constructor(
    protected service: CartService,
    private organizationQuery: OrganizationQuery,
  ) {
    super(service);
  }

  sync() {
    return this.organizationQuery.selectActiveId().pipe(
      switchMap(orgId => this.service.syncCollection(ref => ref.where('status', '==', 'pending'), { params: { orgId }}))
    )
  }
}
