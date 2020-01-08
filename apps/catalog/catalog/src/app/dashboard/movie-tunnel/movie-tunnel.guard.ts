import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { MovieForm } from '@blockframes/movie/movie/form/movie.form';
import { MovieTunnelComponent } from './movie-tunnel.component';

@Injectable({ providedIn: 'root' })
export class MovieTunnelGuard implements CanDeactivate<MovieTunnelComponent> {
  constructor(private form: MovieForm) {}

  // TODO #1472: canDeactivate in movie tunnel guard
  canDeactivate(component: MovieTunnelComponent): boolean {
    this.form.reset();
    return true;
  }
}
