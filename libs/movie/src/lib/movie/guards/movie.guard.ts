import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, UrlTree } from '@angular/router';
import { MovieStore, MovieQuery } from '../+state';

@Injectable({
  providedIn: 'root'
})
export class MovieGuard implements CanActivate {

  constructor(private store: MovieStore, private query: MovieQuery, private router: Router,) {}

  canActivate(route: ActivatedRouteSnapshot): boolean | UrlTree {
    if (!!this.query.getEntity(route.params.id)) {
      this.store.setActive(route.params.id);
      return true;
    } else {
      const redirectTo: UrlTree = this.router.parseUrl('layout/home');
      return redirectTo;
    }
  }
}
