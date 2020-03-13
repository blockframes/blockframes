import { Injectable } from '@angular/core';
import { CollectionConfig, CollectionService } from 'akita-ng-fire';
import { MemberState, MemberStore } from './member.store';
import { OrganizationQuery } from '../../+state/organization.query';
import { map, switchMap } from 'rxjs/operators';
import { OrganizationService } from '@blockframes/organization/+state';
import { AuthService } from '@blockframes/auth';
import { PermissionsQuery } from '@blockframes/organization/permissions/+state/permissions.query';
import { UserRole } from '@blockframes/organization/permissions/+state/permissions.model';
import { OrganizationMember, createOrganizationMember } from './member.model';
import { PermissionsService } from '@blockframes/organization/permissions/+state';

@Injectable({ providedIn: 'root' })
@CollectionConfig({ path: 'users' })
export class MemberService extends CollectionService<MemberState> {

  public userIds$ = this.organizationQuery.selectActive().pipe(
    map(org => org.userIds)
  );

  constructor(
    protected store: MemberStore,
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
