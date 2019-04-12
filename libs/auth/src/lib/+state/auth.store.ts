import { Injectable } from '@angular/core';
import { Store, StoreConfig } from '@datorama/akita';

export interface User {
  uid: string;
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
  isEncrypting: false
}

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'auth' })
export class AuthStore extends Store<AuthState> {
  constructor() {
    super(initialState);
  }
}
