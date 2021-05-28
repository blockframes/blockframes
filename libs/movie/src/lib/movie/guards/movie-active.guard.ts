import { Injectable } from "@angular/core";
import { CollectionGuard, CollectionGuardConfig } from "akita-ng-fire";
import { MovieState } from "../+state/movie.store";
import { MovieService } from "../+state/movie.service";
import { ActivatedRouteSnapshot } from "@angular/router";
import { map } from "rxjs/operators";
import { RouterQuery } from '@datorama/akita-ng-router-store';

@Injectable({ providedIn: 'root' })
@CollectionGuardConfig({ awaitSync: true })
export class MovieActiveGuard extends CollectionGuard<MovieState> {

  constructor(service: MovieService, private routerQuery: RouterQuery) {
    super(service);
  }

  // Sync and set active
  sync(next: ActivatedRouteSnapshot) {
    return this.service.syncActive({ id: next.params.movieId }).pipe(
      map(movie => {
        if (movie) {
          const appName = this.routerQuery.getValue().state.root.data.app;
          const hasAccess = movie.app[appName].access;
          if (hasAccess) {
            return true;
          } else {
            return this.redirect || next.data.redirect;
          }
        } else {
          return this.redirect || next.data.redirect;
        }
      })
    )
  }
}

