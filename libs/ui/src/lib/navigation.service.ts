import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class NavigationService {

  constructor(private router: Router, private location: Location) { }

  goBack(countRouteEvents: number, fallback = ['/c/o']) {
    const state = this.location.getState() as { navigationId: number };
    // We don't want to go further in history than when user first arrived to app
    if (state?.navigationId <= countRouteEvents) {
      this.router.navigate(fallback);
    } else {
      this.location.historyGo(-countRouteEvents);
    }
  }
}