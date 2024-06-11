import { Injectable } from '@angular/core';
import { AuthService } from '../service';
import { map, } from 'rxjs/operators';
import { OrganizationService } from '@blockframes/organization/service';
import { combineLatest } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class NoLandingGuard {
  constructor(
    private authService: AuthService,
    private orgService: OrganizationService,
    private router: Router
  ) { }

  canActivate() {
    return combineLatest([
      this.authService.auth$,
      this.orgService.org$
    ]).pipe(
      map(([authState, org]) => {
        if (!authState || authState.isAnonymous) return this.router.createUrlTree(['/auth']);

        if (!org) return this.router.createUrlTree(['/auth/identity']);

        return this.router.createUrlTree([`/c/o/dashboard/home`]);
      })
    );
  }
}