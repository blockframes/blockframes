import { Injectable } from '@angular/core';
import { CanActivate, CanDeactivate } from '@angular/router';
import { MovieTunnelService } from './movie-tunnel.service';

@Injectable({ providedIn: 'root' })
export class MovieTunnelGuard implements CanActivate, CanDeactivate<any> {
  constructor(private service: MovieTunnelService) {}

  canActivate() {
    this.service.isInTunnel = true;
    return true;
  }
  canDeactivate() {
    this.service.isInTunnel = false;
    return true;
  }

}
