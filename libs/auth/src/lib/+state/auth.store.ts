import { Injectable } from '@angular/core';
import { Store, StoreConfig } from '@datorama/akita';

export interface User {
  uid: string;
  email: string;
}

export interface UserForm {
  email: string;
  pwd: string;
}

export interface AuthState {
  user: User;
  form: UserForm;
}

export function createUser(user: Partial<User>) {
  return { uid: user.uid, email: user.email } as User;
}

export function createInitialState(): AuthState {
  return {
    user: null,
    form: {
      email: '',
      pwd: ''
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
