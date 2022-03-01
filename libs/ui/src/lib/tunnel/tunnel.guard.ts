import { Injectable } from '@angular/core';
import { CanActivate, CanDeactivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { TunnelService } from './tunnel.service';
import { TunnelRoot } from './tunnel.model';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class TunnelGuard implements CanActivate, CanDeactivate<unknown> {
  constructor(private service: TunnelService) { }

  canActivate() {
    this.service.isInTunnel = true;
    return true;
  }
  canDeactivate(
    component: TunnelRoot,
    _: ActivatedRouteSnapshot,
    __: RouterStateSnapshot,
    nextState: RouterStateSnapshot
  ) {
    return component.layout.confirmExit().pipe(
      map(canLeave => {
        if (!canLeave) return false;
        this.service.isInTunnel = false;
        this.service.setUrls(nextState.url);
        return true;
      })
    )
  }
}
