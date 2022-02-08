import { Injectable } from '@angular/core';
import { OrganizationService } from '../+state';
import { CanActivate, Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { combineLatest } from 'rxjs';
import { AuthService } from '@blockframes/auth/+state';

@Injectable({ providedIn: 'root' })
export class OrganizationGuard implements CanActivate {
  constructor(
    private service: OrganizationService,
    private router: Router,
    private authService: AuthService
  ) { }

  canActivate() {
    return combineLatest([
      this.authService.profile$,
      this.service.org$
    ]).pipe(
      map(([user, org]) => {
        if (!user) return this.router.createUrlTree(['/']);
        if (!user.orgId || !org) return this.router.createUrlTree(['/auth/identity']);
        if (org.status !== 'accepted') return this.router.createUrlTree(['/c/organization/create-congratulations']);
        return true;
      })
    );
  }
}
