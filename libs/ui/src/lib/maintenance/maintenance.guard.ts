import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { MaintenanceService } from './maintenance.service';
import { map, tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class MaintenanceGuard implements CanActivate {

  constructor(private service: MaintenanceService, private router: Router) {}

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if (state.url === '/maintenance') {
      return this.service.isInMaintenance$.pipe(
        map(isInMaintenance => isInMaintenance ? true : this.router.parseUrl('/'))
      );
    } else {
      // Listen on maintenance change only if you're not on the maintenance page && not in maintenance already
      return this.service.isInMaintenance$.pipe(
        // Required verification to avoid infinite reload when page goes to maintenance
        // note: redirectOnMaintenance auto-unsubscribe with "first()"
        tap(isInMaintenance => isInMaintenance ? null : this.service.redirectOnMaintenance().subscribe()),
        map(isInMaintenance => isInMaintenance ? this.router.parseUrl('/maintenance') : true),
      );
    }
  }
}