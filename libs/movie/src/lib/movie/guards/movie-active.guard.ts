import { Inject, Injectable } from '@angular/core';
import { MovieService } from '../service';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { Movie } from '@blockframes/model';
import { App } from '@blockframes/utils/apps';
import { APP } from '@blockframes/utils/routes/utils';

@Injectable({ providedIn: 'root' })
export class MovieActiveGuard implements CanActivate {
  public movie: Movie;

  constructor(
    private movieService: MovieService,
    private router: Router,
    @Inject(APP) private app: App
  ) {}

  async canActivate(next: ActivatedRouteSnapshot) {
    this.movie = await this.movieService.getValue(next.params.movieId as string);
    if (this.movie) {
      return this.movie.app[this.app].access || this.router.createUrlTree([next.data.redirect]);
    } else {
      return this.router.createUrlTree([next.data.redirect]);
    }
  }
}
