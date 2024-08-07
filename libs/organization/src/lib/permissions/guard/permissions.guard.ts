import { Injectable } from '@angular/core';
import { PermissionsService } from '../service';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { combineLatest } from 'rxjs';
import { AuthService } from '@blockframes/auth/service';

@Injectable({ providedIn: 'root' })
export class PermissionsGuard {
  constructor(
    private service: PermissionsService,
    private router: Router,
    private authService: AuthService,
  ) { }

  canActivate() {
    return combineLatest([
      this.authService.profile$,
      this.service.permissions$
    ]).pipe(
      map(([user, permissions]) => {
        if (!user) return this.router.createUrlTree(['/']);
        if (!user.orgId || !permissions) return this.router.createUrlTree(['/auth/identity']);
        return true;
      }));
  }
}
