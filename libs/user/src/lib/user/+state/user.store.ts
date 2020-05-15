import { Injectable } from "@angular/core";
import { StoreConfig, EntityStore, EntityState } from "@datorama/akita";
import { User } from "@blockframes/auth/+state/auth.store";

export interface UserState extends EntityState<User> {
}

const initialState: UserState = {
  active: null
};

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'members' })
export class UserStore extends EntityStore<UserState, User> {
  constructor() {
    super(initialState);
  }
}
