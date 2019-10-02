import { Injectable } from '@angular/core';
import { Store, StoreConfig } from '@datorama/akita';

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

export interface UserForm {
  email: string;
  pwd: string;
}
/** User interface with public informations, used in invitations to/from organization. */
export interface PublicUser {
  email: string;
  name: string;
  surname: string;
}

export interface AuthState {
  user: User;
  auth?: { emailVerified: boolean };
  form: UserForm;
  requestedRoute?: string;
}

export function createUser(user: Partial<User> = {}) {
  return {
    avatar: PLACEHOLDER_AVATAR,
    ...user
  } as User;
}

const initialState: AuthState = {
  user: null,
  form: {
    email: '',
    pwd: ''
  },
}

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'auth' })
export class AuthStore extends Store<AuthState> {
  constructor() {
    super(initialState);
  }
  updateUser(user: Partial<User>) {
    this.update(state => ({...state, user: ({...state.user, ...user})}));
  }
}
