import { Inject, Injectable } from '@angular/core';
import { OrganizationService } from '../service';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { combineLatest } from 'rxjs';
import { AuthService } from '@blockframes/auth/service';
import { APP } from '@blockframes/utils/routes/utils';
import { App } from '@blockframes/model';

@Injectable({ providedIn: 'root' })
export class RequestAccessGuard {
  constructor(
    private service: OrganizationService,
    private router: Router,
    private authService: AuthService,
    @Inject(APP) private app: App
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
          const app = this.app;
          if (!org.appAccess[app]) return;
          if (org.appAccess[app].marketplace) return this.router.createUrlTree(['/c/o/marketplace/home']);
          else if (org.appAccess[app].dashboard) return this.router.createUrlTree(['/c/o/dashboard/home']);
          return true;
        }
      })
    );

  }
}
