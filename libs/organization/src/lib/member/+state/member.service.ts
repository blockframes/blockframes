import { Injectable } from '@angular/core';
import { CollectionConfig, CollectionService } from 'akita-ng-fire';
import { MemberState, MemberStore } from './member.store';
import { OrganizationQuery } from '../../+state';
import { map, distinctUntilChanged, switchMap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
@CollectionConfig({ path: 'users' })
export class MemberService extends CollectionService<MemberState> {
  constructor(protected store: MemberStore, private organizationQuery: OrganizationQuery) {
    super(store);
  }

  private userIds$ = this.organizationQuery.selectActive().pipe(
    map(org => org.userIds),
    distinctUntilChanged((old, curr) => old.every(user => curr.includes(user)))
  );

  public syncOrgMembers() {
    return this.userIds$.pipe(
      switchMap(orgIds => this.syncManyDocs(orgIds))
    );
  }
}
