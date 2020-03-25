import { Injectable } from '@angular/core';
import { CollectionConfig, CollectionService } from 'akita-ng-fire';
import { UserState, UserStore } from './user.store';
import { OrganizationService, OrganizationQuery } from '@blockframes/organization/organization/+state';
import { PermissionsQuery } from '@blockframes/permissions/+state/permissions.query';
import { PermissionsService } from '@blockframes/permissions/+state';
import { map } from 'rxjs/operators';
import { AuthService } from '@blockframes/auth/+state/auth.service';
import { OrganizationMember, createOrganizationMember } from './user.model';

@Injectable({ providedIn: 'root' })
@CollectionConfig({ path: 'users' })
export class UserService extends CollectionService<UserState> {

  public userIds$ = this.organizationQuery.selectActive().pipe(
    map(org => org.userIds)
  );

  constructor(
    protected store: UserStore,
    private authService: AuthService,
    private organizationQuery: OrganizationQuery,
    private permissionsQuery: PermissionsQuery,
    private permissionsService: PermissionsService,
    private organizationService: OrganizationService
    ) {
    super(store);
  }

  /** Remove a member from the organization. */
  public removeMember(uid: string) {
    const superAdminNumber = this.permissionsQuery.superAdminCount;
    const role = this.permissionsQuery.getActive().roles[uid];
    if (role === 'superAdmin' && superAdminNumber <= 1) {
      throw new Error('You can\'t remove the last Super Admin.');
    }

    const org = this.organizationQuery.getActive();
    const userIds = org.userIds.filter(userId => userId !== uid);
    return this.organizationService.update(org.id, { userIds });
  }

  public async getMembers(orgId: string) : Promise<OrganizationMember[]> {
    const org = await this.organizationService.getValue(orgId);
    const promises = org.userIds.map(uid => this.authService.getUser(uid));
    const users = await Promise.all(promises);
    const role = await this.permissionsService.getValue(orgId);
    return users.map(u => createOrganizationMember(u, role.roles[u.uid] ? role.roles[u.uid] : undefined));
  }
}
