import { CartState } from '../distribution-deal/+state/cart.store';
import { Injectable } from '@angular/core';
import { CollectionGuard, CollectionGuardConfig } from 'akita-ng-fire';
import { CartService } from '../distribution-deal/+state/cart.service';

@Injectable({ providedIn: 'root' })
@CollectionGuardConfig({ awaitSync: true })
export class CatalogCartGuard extends CollectionGuard<CartState> { // TODO #1061 rename
  constructor(protected service: CartService) {
    super(service);
  }

  sync() {
    // TODO #1027 : change in syncCollection(path, queryFn)
    return this.service.syncQuery();
  }
}
