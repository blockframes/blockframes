import { Injectable } from '@angular/core';
import { EntityState, EntityStore, StoreConfig } from '@datorama/akita';
import { OrgMember } from './organization.model';

export interface OrgMembersState extends EntityState<OrgMember> {
}

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'members', idKey: 'id' })
export class OrgMembersStore extends EntityStore<OrgMembersState, OrgMember> {
  constructor() {
    super({});
  }
}
