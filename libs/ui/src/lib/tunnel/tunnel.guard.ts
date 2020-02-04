import { Injectable } from '@angular/core';
import { CanActivate, CanDeactivate } from '@angular/router';
import { TunnelService } from './tunnel.service';

@Injectable({ providedIn: 'root' })
export class TunnelGuard implements CanActivate, CanDeactivate<any> {
  constructor(private service: TunnelService) {}

  canActivate() {
    this.service.isInTunnel = true;
    return true;
  }
  canDeactivate() {
    this.service.isInTunnel = false;
    return true;
  }

}
