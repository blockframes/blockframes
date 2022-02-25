import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot } from '@angular/router';
import { App } from '../apps';

@Injectable({ providedIn: 'root' })
export class AppGuard implements CanActivate {
  currentApp: App;

  canActivate(next: ActivatedRouteSnapshot) {
    this.currentApp = next.data.app;

    return true;
  }
}
