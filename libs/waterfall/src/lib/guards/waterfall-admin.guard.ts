import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { WaterfallPermissionsService } from '../permissions.service';
import { OrganizationService } from '@blockframes/organization/service';
import { AuthService } from '@blockframes/auth/service';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class WaterfallAdminGuard implements CanActivate {

  constructor(
    private permissionService: WaterfallPermissionsService,
    private authService: AuthService,
    private orgService: OrganizationService,
    private router: Router
  ) { }

  async canActivate(next: ActivatedRouteSnapshot) {
    const isBlockframesAdmin = await firstValueFrom(this.authService.isBlockframesAdmin$);
    const permission = await this.permissionService.getValue(this.orgService.org.id, { waterfallId: next.params.movieId });
    if (isBlockframesAdmin || permission?.isAdmin) return true;

    if (next.data.relative) {
      return this.router.createUrlTree(['/c/o/dashboard/title', next.params.movieId, next.data.redirect]);
    } else {
      return this.router.createUrlTree([next.data.redirect]);
    }

  }
}
