import { Injectable } from "@angular/core";
import { CollectionGuard, CollectionGuardConfig } from "akita-ng-fire";
import { MovieState } from "../+state/movie.store";
import { MovieService } from "../+state/movie.service";
import { ActivatedRouteSnapshot } from "@angular/router";
import { map } from "rxjs/operators";
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { MovieAppAccess } from "@blockframes/utils/apps";

function haveAppAccess(appName: string, appAccess: MovieAppAccess): boolean {
  return appAccess[appName];
}

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
        if (!!movie) {
          const appName = this.routerQuery.getValue().state.root.data.app;
          return haveAppAccess(appName, movie.main.storeConfig.appAccess);
        } else {
          return this.redirect || next.data.redirect;
        }
      })
    )
  }
}

