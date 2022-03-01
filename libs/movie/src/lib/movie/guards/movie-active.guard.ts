import { Inject, Injectable } from "@angular/core";
import { CollectionGuardConfig } from "akita-ng-fire";
import { MovieService } from "../+state/movie.service";
import { ActivatedRouteSnapshot, CanActivate, Router } from "@angular/router";
import { Movie } from "../+state";
import { App } from "@blockframes/utils/apps";
import { APP } from "@blockframes/utils/routes/create-routes";

@Injectable({ providedIn: 'root' })
@CollectionGuardConfig({ awaitSync: true })
export class MovieActiveGuard implements CanActivate {

  public movie: Movie;

  constructor(
    private movieService: MovieService,
    private router: Router,
    @Inject(APP) private app: App
  ) { }

  async canActivate(next: ActivatedRouteSnapshot) {
    this.movie = await this.movieService.getValue(next.params.movieId as string);
    if (this.movie) {
      return this.movie.app[this.app].access || this.router.createUrlTree([next.data.redirect]);
    } else {
      return this.router.createUrlTree([next.data.redirect]);
    }
  }

}

