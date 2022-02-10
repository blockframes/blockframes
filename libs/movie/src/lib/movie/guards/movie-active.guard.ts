import { Injectable } from "@angular/core";
import { CollectionGuardConfig } from "akita-ng-fire";
import { MovieService } from "../+state/movie.service";
import { ActivatedRouteSnapshot, CanActivate, Router } from "@angular/router";
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { getCurrentApp } from "@blockframes/utils/apps";

@Injectable({ providedIn: 'root' })
@CollectionGuardConfig({ awaitSync: true })
export class MovieActiveGuard implements CanActivate {

  constructor(
    private movieService: MovieService,
    private routerQuery: RouterQuery,
    private router: Router,
  ) { }

  async canActivate(route: ActivatedRouteSnapshot) {
    this.movieService.syncActive({ id: route.params.movieId }).subscribe() // @TODO #7282 remove
    const movie = await this.movieService.getValue(route.params.movieId as string);
    if (movie) {
      const currentApp = getCurrentApp(this.routerQuery);
      return movie.app[currentApp].access || this.router.createUrlTree([route.data.redirect]);
    } else {
      return this.router.createUrlTree([route.data.redirect]);
    }
  }

}

