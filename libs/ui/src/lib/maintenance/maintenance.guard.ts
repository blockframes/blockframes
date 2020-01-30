import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { MaintenanceService } from './maintenance.service';
import { map } from 'rxjs/operators';
import { Subscription } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MaintenanceGuard implements CanActivate {
  private sub: Subscription;

  constructor(private service: MaintenanceService, private router: Router) {}

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const segments = state.url.split('/');
    const path = segments.pop(); // After this mutation segment should be empty is url "/maintenance"
    // If path is 
    if (path === 'maintenance' && !segments.length) {
      return this.service.isInMaintenance$.pipe(
        map(isInMaintenance => isInMaintenance ? true : this.router.parseUrl('/'))
      );
    } else {
      this.sub = this.service.redirectOnMaintenance().subscribe();
      return this.service.isInMaintenance$.pipe(
        map(isInMaintenance => isInMaintenance ? this.router.parseUrl('/maintenance') : true)
      );
    }
  }

  canDeactivate() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }
}