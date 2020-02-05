import { Injectable } from '@angular/core';
import { CollectionConfig, CollectionService } from 'akita-ng-fire';
import { MemberState, MemberStore } from './member.store';
import { OrganizationQuery } from '../../+state/organization.query';
import { map, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { OrganizationService } from '@blockframes/organization/+state';
import { remove } from 'lodash';
import { PermissionsQuery, PermissionsService } from '@blockframes/organization/permissions/+state';
import { AuthService } from '@blockframes/auth';

@Injectable({ providedIn: 'root' })
@CollectionConfig({ path: 'users' })
export class MemberService extends CollectionService<MemberState> {
  constructor(
    protected store: MemberStore,
    private organizationQuery: OrganizationQuery,
    private organizationService: OrganizationService,
    private permissionsQuery: PermissionsQuery,
    private permissionsService: PermissionsService,
    private authService: AuthService
    ) {
    super(store);
  }

  private userIds$ = this.organizationQuery.selectActive().pipe(
    map(org => org.userIds),
    distinctUntilChanged((old, curr) => old.every(user => curr.includes(user)))
  );

  public syncOrgMembers() {
    return this.userIds$.pipe(
      switchMap(userIds => this.syncManyDocs(userIds))
    );
  }

  /** Remove a member from the organization. */
  public removeMember(uid: string) {
    const org = this.organizationQuery.getActive();
    const userIds = org.userIds.filter(userId => userId !== uid);
    return this.organizationService.update(org.id, { userIds });
  }
}
