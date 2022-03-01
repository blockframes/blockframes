import { Injectable } from "@angular/core";
import { CollectionGuardConfig } from "akita-ng-fire";
import { MovieService } from "../+state/movie.service";
import { ActivatedRouteSnapshot, CanActivate, Router } from "@angular/router";
import { Movie } from "../+state";
import { AppGuard } from "@blockframes/utils/routes/app.guard";

@Injectable({ providedIn: 'root' })
@CollectionGuardConfig({ awaitSync: true })
export class MovieActiveGuard implements CanActivate {

  public movie: Movie;

  constructor(
    private movieService: MovieService,
    private router: Router,
    private appGuard: AppGuard,
  ) { }

  async canActivate(next: ActivatedRouteSnapshot) {
    this.movie = await this.movieService.getValue(next.params.movieId as string);
    if (this.movie) {
      const currentApp = this.appGuard.currentApp;
      return this.movie.app[currentApp].access || this.router.createUrlTree([next.data.redirect]);
    } else {
      return this.router.createUrlTree([next.data.redirect]);
    }
  }

}

