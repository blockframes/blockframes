import { Injectable} from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class NavigationService {

  constructor(private router: Router, private location: Location) {}
    
  back() {
    const state = this.location.getState() as { navigationId: number };
    state?.navigationId === 1
      ? this.router.navigate(['/c/o'])
      : this.location.historyGo(-1);
  }
}