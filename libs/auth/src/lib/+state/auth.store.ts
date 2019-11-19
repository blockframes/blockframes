import { Injectable } from '@angular/core';
import { Store, StoreConfig } from '@datorama/akita';
import { FireAuthState } from 'akita-ng-fire';

export const PLACEHOLDER_AVATAR = '/assets/logo/profil_avatar_250.svg';

export interface User {
  uid: string;
  financing: {
    rank: string
  };
  email: string;
  name: string;
  surname: string;
  phoneNumber: string;
  position: string;
  orgId: string;
  avatar: string;
}

/** A user interface with public informations */
export interface PublicUser {
  uid: string;
  email: string;
  name?: string;
  surname?: string;
}

export interface AuthState extends FireAuthState<User> {
  auth?: { emailVerified: boolean };
  requestedRoute?: string;
  profile: User;
}

export function createUser(user: Partial<User> = {}) {
  return {
    avatar: "",
    ...user
  } as User;
}

const initialState: AuthState = {
  uid: null,
  profile: null,
  loading: false
}

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'auth' })
export class AuthStore extends Store<AuthState> {
  constructor() {
    super(initialState);
  }
  createProfile(user: User) {
    console.log('createProfile', user)
    return { uid: user.uid }
  }
}
