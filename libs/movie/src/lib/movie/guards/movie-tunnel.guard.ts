import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { AuthService } from '@blockframes/auth/service';
import { OrganizationService } from '@blockframes/organization/service';
import { firstValueFrom } from 'rxjs';
import { MovieService } from '../service';
import { WaterfallService } from '@blockframes/waterfall/waterfall.service';

@Injectable({ providedIn: 'root' })
export class MovieTunnelGuard implements CanActivate {
  constructor(
    private router: Router,
    private orgService: OrganizationService,
    private movieService: MovieService,
    private waterfallService: WaterfallService,
    private authService: AuthService,
  ) { }

  async canActivate(next: ActivatedRouteSnapshot) {
    const movieId: string = next.params['movieId'];
    const movie = await this.movieService.getValue(movieId);
    const isBlockframesAdmin = await firstValueFrom(this.authService.isBlockframesAdmin$);
    if (isBlockframesAdmin) return true;
    const org = this.orgService.org;
    if (movie.orgIds.includes(org.id)) return true;
    const waterfall = await this.waterfallService.getValue(movieId);
    if (waterfall.orgIds.includes(org.id)) return true;

    return this.router.parseUrl(`/c/o/dashboard/title`);
  }
}
