import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class MovieTunnelGuard implements CanDeactivate{
  constructor() {}
  // TODO #1472: canDeactivate in movie tunnel guard
  canDeactivate(): boolean {
    return true;
  }
}
