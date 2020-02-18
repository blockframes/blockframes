import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, UrlTree } from '@angular/router';
import { IpStore } from '../+state';
import { IpResolver } from './ip.resolver';

@Injectable({
  providedIn: 'root'
})
export class IpGuard implements CanActivate {
  constructor(
    private router: Router,
    private store: IpStore,
    private ipResolver: IpResolver,
  ) {
  }

  canActivate(route: ActivatedRouteSnapshot): boolean | UrlTree {
    const ip = this.ipResolver.resolve(route);

    if (ip !== undefined ) {
      this.store.setActive(ip.id);
      return true;
    } else {
      const fallbackUrl = route.data.fallback !== '' &&  route.data.fallback !== undefined ? route.data.fallback : '/c/home';
      return this.router.parseUrl(fallbackUrl);
    }
  }
}
