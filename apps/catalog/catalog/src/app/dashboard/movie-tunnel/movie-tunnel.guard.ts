import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';
import { CollectionGuard, CollectionGuardConfig } from 'akita-ng-fire';
import { MovieState, MovieService } from '@blockframes/movie';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
@CollectionGuardConfig({ awaitSync: true })
export class MovieTunnelGuard extends CollectionGuard<MovieState> {
  constructor(
    protected service: MovieService,
  ) {
    super(service);
  }

  sync(next: ActivatedRouteSnapshot) {
    return this.service.syncActive({ id: next.params.movieId }).pipe(
      map(movie => !!movie ? true : 'c/o/dashboard/movie-tunnel')
    )
  }
}
