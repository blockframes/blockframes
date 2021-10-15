import { Injectable } from '@angular/core';
import { Store, StoreConfig } from '@datorama/akita';
import { FireAuthState, initialAuthState, RoleState } from 'akita-ng-fire';
import { User } from '@blockframes/user/+state/user.firestore';
import { createStorageFile } from '@blockframes/media/+state/media.firestore';
import { Person } from '@blockframes/utils/common-interfaces';

export { User } from '@blockframes/user/+state/user.firestore';

export interface AnonymousCredentials extends Person {
  role?: 'guest' | 'organizer'; // Role for events
  email?: string,
  invitationId?: string, // Invitation for the event
}
export interface Roles {
  blockframesAdmin: boolean;
}

export interface AuthState extends FireAuthState<User>, RoleState<Roles> {
  requestedRoute?: string;
  anonymousCredentials?: AnonymousCredentials;
}

export function createUser(user: Partial<User> = {}) {
  return {
    ...user,
    avatar: createStorageFile(user.avatar),
    watermark: createStorageFile(user.watermark)
  } as User;
}

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'auth' })
export class AuthStore extends Store<AuthState> {
  constructor() {
    super(initialAuthState);
  }
  public updateProfile(profile: Partial<User>) {
    this.update(authState => ({ profile: { ...authState.profile, profile } }))
  }

  public updateAnonymousCredentials(anonymousCredentials: Partial<AnonymousCredentials>) {
    this.update(authState => ({ anonymousCredentials: { ...authState.anonymousCredentials, ...anonymousCredentials } }));
  }
}
