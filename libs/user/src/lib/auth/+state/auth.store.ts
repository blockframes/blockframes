import { Injectable } from '@angular/core';
import { Store, StoreConfig } from '@datorama/akita';
import { FireAuthState, initialAuthState, RoleState } from 'akita-ng-fire';
import { User } from '@blockframes/user/+state/user.firestore';
import { createStorageFile } from '@blockframes/media/+state/media.firestore';

export { User } from '@blockframes/user/+state/user.firestore';

export interface Roles {
  blockframesAdmin: boolean;
}

export interface AuthState extends FireAuthState<User>, RoleState<Roles> {}

export function createUser(user: Partial<User> = {}) {
  return {
    ...user,
    avatar: createStorageFile(user.avatar)
  } as User;
}

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'auth' })
export class AuthStore extends Store<AuthState> {
  constructor() {
    super(initialAuthState);
  }

}
