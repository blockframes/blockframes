import { Injectable } from '@angular/core';
import { DeliveryState, DeliveryService, DeliveryQuery } from '../+state';
import { CollectionGuardConfig, CollectionGuard } from 'akita-ng-fire';
import { map } from 'rxjs/operators';
import { MovieQuery } from '@blockframes/movie';

@Injectable({ providedIn: 'root' })
@CollectionGuardConfig({ awaitSync: true })
export class DeliveryListGuard extends CollectionGuard<DeliveryState> {
  constructor(
    protected service: DeliveryService,
    private query: DeliveryQuery,
    private movieQuery: MovieQuery
  ) {
    super(service);
  }

  public get urlFallback() {
    return `layout/o/delivery/add/${this.movieQuery.getActiveId()}/2-choose-starter`;
  }

  sync() {
    return this.service.syncDeliveriesQuery().pipe(
      map(_ => this.query.getCount()),
      map(count => count === 0 ? this.urlFallback : true)
    );
  }
}
