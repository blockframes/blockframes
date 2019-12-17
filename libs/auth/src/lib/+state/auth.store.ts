import { Injectable } from '@angular/core';
import { Store, StoreConfig } from '@datorama/akita';
import { FireAuthState, initialAuthState } from 'akita-ng-fire';
import { User } from './auth.firestore';

export const PLACEHOLDER_AVATAR = '/assets/logo/profil_avatar_250.svg';

export interface AuthState extends FireAuthState<User> {
  requestedRoute?: string;
}

export function createUser(user: Partial<User> = {}) {
  return {
    avatar: "",
    ...user
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
