import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate } from '@angular/router';
import { UserService } from '@blockframes/user/service';

@Injectable({ providedIn: 'root' })
export class HasOrganizationGuard implements CanActivate {
  constructor(private service: UserService) { }

  async canActivate(next: ActivatedRouteSnapshot) {
    const userId: string = next.params['userId'];
    const user = await this.service.getValue(userId);

    return !!user.orgId;
  }
}
