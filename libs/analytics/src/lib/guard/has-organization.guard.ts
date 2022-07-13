import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { OrganizationService } from '@blockframes/organization/service';
import { UserService } from '@blockframes/user/service';

@Injectable({ providedIn: 'root' })
export class HasOrganizationGuard implements CanActivate {
  constructor(
    private service: UserService,
    private router: Router,
    private orgService: OrganizationService
  ) { }

  async canActivate(next: ActivatedRouteSnapshot) {
    const userId: string = next.params['userId'];
    const user = await this.service.getValue(userId);

    if (!user?.orgId) return this.router.createUrlTree(['c/o/dashboard/home/buyer']);

    const org = await this.orgService.getValue(user.orgId);
    return org.status === 'accepted' ? true : this.router.createUrlTree(['c/o/dashboard/home/buyer']);
  }
}
