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
  name: string;
  surname: string;
  phoneNumber: string;
  position: string,
  orgId: string;
}

export interface UserForm {
  email: string;
  pwd: string;
}

export interface AccountForm {
  name: string;
  surname: string;
  phoneNumber: string;
  email: string;
  position: string;
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
    name: '',
    surname: '',
    phoneNumber: '',
    email: '',
    position: ''
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
