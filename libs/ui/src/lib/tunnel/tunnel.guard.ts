import { Injectable } from '@angular/core';
import { CanActivate, CanDeactivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { TunnelService } from './tunnel.service';

@Injectable({ providedIn: 'root' })
export class TunnelGuard implements CanActivate, CanDeactivate<any> {
  constructor(private service: TunnelService) {}

  canActivate() {
    this.service.isInTunnel = true;
    return true;
  }
  canDeactivate(
    component: any,
    currentRoute: ActivatedRouteSnapshot,
    currentState: RouterStateSnapshot,
    nextState: RouterStateSnapshot
  ) {
    this.service.isInTunnel = false;
    this.service.setUrls(nextState.url);
    return true;
  }

}
