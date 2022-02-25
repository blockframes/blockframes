import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot } from '@angular/router';
import { App } from '../apps';

@Injectable({ providedIn: 'root' })
export class AppGuard implements CanActivate {
  currentApp: App;

  canActivate(activatedRoute: ActivatedRouteSnapshot) {
    this.currentApp = activatedRoute.data.app;

    return true;
  }
}
