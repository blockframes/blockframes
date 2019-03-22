import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate } from '@angular/router';
import { MovieStore } from '../+state';

@Injectable({
  providedIn: 'root'
})
export class MovieGuard implements CanActivate {

  constructor(private store: MovieStore) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    this.store.setActive(route.params.id);
    return true;
  }

}
