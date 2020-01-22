import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';
import { CollectionGuard } from 'akita-ng-fire';
import { MovieState, MovieService } from '@blockframes/movie';

@Injectable({ providedIn: 'root' })
export class MovieTunnelGuard extends CollectionGuard<MovieState> {
  constructor(protected service: MovieService) {
    super(service);
  }

  sync(next: ActivatedRouteSnapshot) {
    return this.service.syncActive({ id: next.params.movieId });
  }
}
