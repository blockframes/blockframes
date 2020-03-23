import { Injectable } from "@angular/core";
import { StoreConfig, EntityStore, EntityState } from "@datorama/akita";
import { OrganizationMember } from "./user.model";

export interface UserState extends EntityState<OrganizationMember> {
}

const initialState: UserState = {
  active: null
};

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'members' })
export class UserStore extends EntityStore<UserState, OrganizationMember> {
  constructor() {
    super(initialState);
  }
}
