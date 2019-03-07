import { Injectable } from '@angular/core';
import { QueryEntity } from '@datorama/akita';
import { OrgMembersState, OrgMembersStore } from './org-members.store';
import { OrgMember } from './organization.model';

@Injectable({
  providedIn: 'root'
})
export class OrgMembersQuery extends QueryEntity<OrgMembersState, OrgMember> {
  constructor(protected store: OrgMembersStore) {
    super(store);
  }
}
