import { Inject, Injectable } from '@angular/core';
import { PermissionsService } from '../service';
import { CanActivate, Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { combineLatest } from 'rxjs';
import { AuthService } from '@blockframes/auth/service';
import { App } from '@blockframes/model';
import { APP } from '@blockframes/utils/routes/utils';

@Injectable({ providedIn: 'root' })
export class PermissionsGuard implements CanActivate {
  constructor(
    private service: PermissionsService,
    private router: Router,
    private authService: AuthService,
    @Inject(APP) private app: App
  ) { }

  canActivate() {
    return combineLatest([
      this.authService.profile$,
      this.service.permissions$
    ]).pipe(
      map(([user, permissions]) => {
        if (!user) return this.router.createUrlTree(['/']);
        if (!user.orgId || !permissions) return this.router.createUrlTree(['/auth/identity']);
        if (!user.legalTerms?.privacyPolicy || !user.legalTerms?.tc[this.app]) {
          return this.router.createUrlTree(['/auth/checkPrivacyAndTerms']);
        }
        return true;
      }));
  }
}
