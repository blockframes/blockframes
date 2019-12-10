import { BasketState } from '../distribution-right/+state/basket.store';
import { Injectable } from '@angular/core';
import { CollectionGuard, CollectionGuardConfig } from 'akita-ng-fire';
import { BasketService } from '../distribution-right/+state/basket.service';

@Injectable({ providedIn: 'root' })
@CollectionGuardConfig({ awaitSync: true })
export class CatalogBasketGuard extends CollectionGuard<BasketState> {
  constructor(protected service: BasketService) {
    super(service);
  }

  sync() {
    // TODO #1027 : change in syncCollection(path, queryFn)
    return this.service.syncQuery();
  }
}
