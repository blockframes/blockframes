import { Injectable} from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class NavigationService {

  countRouteEvents = 0;
 
  constructor(private router: Router, private location: Location) {}
    
  back(fallback: string[]) {
    const state = this.location.getState() as { navigationId: number };
    state?.navigationId === 1
      ? this.router.navigate(fallback)
      : this.location.historyGo(-this.countRouteEvents);
  }
}