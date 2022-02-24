import { Injectable } from "@angular/core";
import { CollectionGuardConfig } from "akita-ng-fire";
import { MovieService } from "../+state/movie.service";
import { ActivatedRoute, ActivatedRouteSnapshot, CanActivate, Router } from "@angular/router";
import { getCurrentApp } from "@blockframes/utils/apps";
import { Movie } from "../+state";

@Injectable({ providedIn: 'root' })
@CollectionGuardConfig({ awaitSync: true })
export class MovieActiveGuard implements CanActivate {

  public movie: Movie;

  constructor(
    private movieService: MovieService,
    private route: ActivatedRoute,
    private router: Router,
  ) { }

  async canActivate(route: ActivatedRouteSnapshot) {
    this.movie = await this.movieService.getValue(route.params.movieId as string);
    if (this.movie) {
      const currentApp = getCurrentApp(this.route);
      return this.movie.app[currentApp].access || this.router.createUrlTree([route.data.redirect]);
    } else {
      return this.router.createUrlTree([route.data.redirect]);
    }
  }

}

