import { Injectable } from '@angular/core';
import { CanDeactivate, CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { MovieForm } from '@blockframes/movie/form/movie.form';
import { MovieQuery } from '@blockframes/movie';
import { MovieTunnelComponent } from './movie-tunnel.component';

@Injectable({ providedIn: 'root' })
export class MovieTunnelGuard implements CanActivate, CanDeactivate<MovieTunnelComponent> {
  constructor(
    private query: MovieQuery,
    private form: MovieForm,
    private router: Router,
  ) {}

  // Fill the form with the current content of the movie
  canActivate({ params }: ActivatedRouteSnapshot) {
    const movie = params.movieId === 'create' ? {} : this.query.getEntity(params.movieId);
    if (!movie) {
      return this.router.parseUrl('dashboard');
    }
    this.form.patchValue(movie)
    return true;
  }

  // TODO #1472: canDeactivate in movie tunnel guard
  canDeactivate(component: MovieTunnelComponent): boolean {
    this.form.reset();
    return true;
  }
}
