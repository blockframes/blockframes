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
}

export function createUser(user: Partial<User>) {
  return {
    uid: user.uid,
    email: user.email,
    lastName: user.lastName,
    firstName: user.firstName,
    biography: user.biography,
  } as User;
}

export function createInitialState(): AuthState {
  return {
    user: null,
    form: {
      email: '',
      pwd: ''
    },
    accountForm: {
      lastName: '',
      firstName: '',
      biography: '',
    }
  };
}

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'auth' })
export class AuthStore extends Store<AuthState> {
  constructor() {
    super(createInitialState());
  }
}
