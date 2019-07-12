import * as firebase from 'firebase';
import { Injectable } from '@angular/core';
import { Store, StoreConfig } from '@datorama/akita';

export interface User {
  uid: string;
  identity: {
    domain: string,
    address: string
  };
  balance: string;
  email: string;
  //TODO: issue#60 delete lastName and firstName
  lastName: string;
  firstName: string;
  name: string,
  surname: string,
  biography: string;
  orgId: string;
}

export interface UserForm {
  email: string;
  pwd: string;
}

export interface AccountForm {
  lastName: string;
  firstName: string;
  biography: string;
}

export interface AuthState {
  user: User;
  auth?: { emailVerified: boolean };
  form: UserForm;
  accountForm: AccountForm;
  requestedRoute?: string;
  isEncrypting: boolean;
  isBalanceLoading: boolean;
}

export function createUser(user: Partial<User> = {}) {
  return {
    ...user
  } as User;
}

const initialState: AuthState = {
  user: null,
  form: {
    email: '',
    pwd: ''
  },
  accountForm: {
    lastName: '',
    firstName: '',
    biography: '',
  },
  isEncrypting: false,
  isBalanceLoading: false,
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
