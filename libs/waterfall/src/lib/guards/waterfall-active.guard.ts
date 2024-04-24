import { Injectable } from '@angular/core';
import { WaterfallService } from '../waterfall.service';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class WaterfallActiveGuard implements CanActivate {

  constructor(
    private waterfallService: WaterfallService,
    private router: Router,
  ) { }

  async canActivate(next: ActivatedRouteSnapshot) {
    const redirect = next.data.redirect || '/c/o/dashboard/home';
    try {
      const waterfall = await this.waterfallService.getValue(next.params.movieId as string);
      if (waterfall) {
        return !!waterfall.id || this.router.createUrlTree([redirect]);
      } else {
        return this.router.createUrlTree([redirect]);
      }
    } catch (_) {
      return this.router.createUrlTree([redirect]);
    }

  }
}
