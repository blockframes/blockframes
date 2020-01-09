import { Injectable } from '@angular/core';
import { DeliveryService, DeliveryState, DeliveryQuery } from '../+state';
import { map } from 'rxjs/operators';
import { MovieQuery } from '@blockframes/movie';
import { CollectionGuard, CollectionGuardConfig } from 'akita-ng-fire';

@Injectable({ providedIn: 'root' })
@CollectionGuardConfig({ awaitSync: true })
export class DeliveryListGuard extends CollectionGuard<DeliveryState> {
  public get urlFallback() {
    return `/c/o/delivery/movie/add/${this.movieQuery.getActiveId()}/2-choose-starter`;
  }

  constructor(
    protected service: DeliveryService,
    private movieQuery: MovieQuery,
    private query: DeliveryQuery
  ) {
    super(service);
  }

  sync() {
    return this.service.syncDeliveryListQuery().pipe(
      map(_ => this.query.getCount()),
      map(count => count === 0 ? this.urlFallback : true)
    );
  }
}
