import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { OrganizationService } from '@blockframes/organization/+state';
import { MovieService } from '../+state/movie.service';

@Injectable({ providedIn: 'root' })
export class MovieTunnelGuard implements CanActivate {
  constructor(
    private router: Router,
    private orgService: OrganizationService,
    private movieService: MovieService
  ) { }

  async canActivate(next: ActivatedRouteSnapshot) {
    const movieId: string = next.params['movieId'];
    const movie = await this.movieService.getValue(movieId);
    const org = this.orgService.org;
    if (movie.orgIds.includes(org.id)) {
      return true;
    }
    return this.router.parseUrl(`/c/o/dashboard/title`);
  }
}
