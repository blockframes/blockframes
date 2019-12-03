import { Injectable } from "@angular/core";
import { StoreConfig, EntityStore, EntityState } from "@datorama/akita";
import { OrganizationMember } from "./member.model";

export interface MemberState extends EntityState<OrganizationMember> {
}

const initialState: MemberState = {
  active: null
};

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'members' })
export class MemberStore extends EntityStore<MemberState, OrganizationMember> {
  constructor() {
    super(initialState);
  }
}
