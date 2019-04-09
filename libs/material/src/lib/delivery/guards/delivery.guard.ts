import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, UrlTree, Router } from '@angular/router';
import { DeliveryStore } from '../+state/delivery.store';
import { DeliveryQuery } from '../+state/delivery.query';

@Injectable({
  providedIn: 'root'
})
export class DeliveryGuard implements CanActivate {
  constructor(private store: DeliveryStore, private query: DeliveryQuery, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean | UrlTree {
    if (!!this.query.getEntity(route.params.deliveryId)) {
      this.store.setActive(route.params.deliveryId);
      return true;
    } else {
      const redirectTo: UrlTree = this.router.parseUrl('layout');
      return redirectTo;
    }
  }
}
