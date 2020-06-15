import { Injectable } from '@angular/core';
import { Store, StoreConfig } from '@datorama/akita';
import { FireAuthState, initialAuthState, RoleState } from 'akita-ng-fire';
import { createImgRef } from '@blockframes/utils/media/media.firestore';
import { User } from '@blockframes/user/+state/user.firestore';

export { User } from '@blockframes/user/+state/user.firestore';
export const PLACEHOLDER_AVATAR = '/assets/logo/profil_avatar_250.svg';


export interface Roles {
  blockframesAdmin: boolean;
}

export interface AuthState extends FireAuthState<User>, RoleState<Roles> {
  requestedRoute?: string;
}

export function createUser(user: Partial<User> = {}) {
  return {
    ...user,
    avatar: createImgRef(user.avatar),
    watermark: createImgRef(user.watermark),
  } as User;
}

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'auth' })
export class AuthStore extends Store<AuthState> {
  constructor() {
    super(initialAuthState);
  }
  public updateProfile(profile: Partial<User>) {
    this.update(authState => ({ profile: { ...authState.profile, profile }}))
  }
}
