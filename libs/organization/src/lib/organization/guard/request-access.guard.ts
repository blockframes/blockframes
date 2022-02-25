import { Injectable } from '@angular/core';
import { OrganizationService } from '../+state';
import { CanActivate, Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { combineLatest } from 'rxjs';
import { AuthService } from '@blockframes/auth/+state';
import { AppGuard } from '@blockframes/utils/routes/app.guard';

@Injectable({ providedIn: 'root' })
export class RequestAccessGuard implements CanActivate {
  constructor(
    private service: OrganizationService,
    private router: Router,
    private authService: AuthService,
    private appGuard: AppGuard,
  ) { }

  canActivate() {
    return combineLatest([
      this.authService.profile$,
      this.service.org$
    ]).pipe(
      map(([user, org]) => {
        if (!user) return this.router.createUrlTree(['/']);
        if (!user.orgId) return this.router.createUrlTree(['/auth/identity']);

        if (org.status === 'accepted') {
          const app = this.appGuard.currentApp;
          if (!org.appAccess[app]) return;
          if (org.appAccess[app].marketplace) return this.router.createUrlTree(['/c/o/marketplace/home']);
          else if (org.appAccess[app].dashboard) return this.router.createUrlTree(['/c/o/dashboard/home']);
          return true;
        }
      })
    );

  }
}
