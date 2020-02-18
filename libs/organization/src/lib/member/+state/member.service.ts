import { Injectable } from '@angular/core';
import { CollectionConfig, CollectionService } from 'akita-ng-fire';
import { MemberState, MemberStore } from './member.store';
import { OrganizationQuery } from '../../+state/organization.query';
import { map, switchMap } from 'rxjs/operators';
import { OrganizationService } from '@blockframes/organization/+state';
import { AuthQuery } from '@blockframes/auth';
import { PermissionsQuery } from '@blockframes/organization/permissions/+state/permissions.query';
import { UserRole } from '@blockframes/organization/permissions/+state/permissions.model';


@Injectable({ providedIn: 'root' })
@CollectionConfig({ path: 'users' })
export class MemberService extends CollectionService<MemberState> {
  constructor(
    protected store: MemberStore,
    private authQuery: AuthQuery,
    private organizationQuery: OrganizationQuery,
    private permissionsQuery: PermissionsQuery,
    private organizationService: OrganizationService
    ) {
    super(store);
  }

  private userIds$ = this.organizationQuery.selectActive().pipe(
    map(org => org.userIds)
  );

  public syncOrgMembers() {
    return this.userIds$.pipe(
      switchMap(userIds => this.syncManyDocs(userIds))
    );
  }

  /** Remove a member from the organization. */
  public removeMember(uid: string) {
    const superAdminNumber = this.permissionsQuery.superAdminCount;
    const role = this.permissionsQuery.getActive().roles[uid];
    if (role === UserRole.superAdmin && superAdminNumber <= 1) {
      throw new Error('You can\'t remove the last Super Admin.');
    }

    const org = this.organizationQuery.getActive();
    const userIds = org.userIds.filter(userId => userId !== uid);
    return this.organizationService.update(org.id, { userIds });
  }
}
