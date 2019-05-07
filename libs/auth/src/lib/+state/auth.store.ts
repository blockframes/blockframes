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
  lastName: string;
  firstName: string;
  biography: string;
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
  form: UserForm;
  accountForm: AccountForm;
  requestedRoute?: string;
  isEncrypting: boolean;
  isBalanceLoading: boolean;
}

export function createUser(user: Partial<User>) {
  return { ...user } as User;
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
