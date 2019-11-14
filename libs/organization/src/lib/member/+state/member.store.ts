import { Injectable } from "@angular/core";
import { StoreConfig, EntityStore } from "@datorama/akita";
import { CollectionState } from "akita-ng-fire";
import { OrganizationMember } from "./member.model";

export interface MemberState extends CollectionState<OrganizationMember> {
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
