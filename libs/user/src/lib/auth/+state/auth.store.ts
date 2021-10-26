import { Injectable } from '@angular/core';
import { Store, StoreConfig } from '@datorama/akita';
import { FireAuthState, initialAuthState, RoleState } from 'akita-ng-fire';
import { User } from '@blockframes/user/+state/user.firestore';
import { createStorageFile } from '@blockframes/media/+state/media.firestore';
import { Person } from '@blockframes/utils/common-interfaces';
import { AccessibilityTypes } from '@blockframes/utils/static-model/types';

export { User } from '@blockframes/user/+state/user.firestore';

export interface AnonymousCredentials extends Person {

  uid: string;
  role?: 'guest' | 'organizer'; // Role for events
  email?: string,
  emailVerified?: boolean,
  invitationId?: string, // Invitation for the event
}
export interface Roles {
  blockframesAdmin: boolean;
}

export interface AuthState extends FireAuthState<User>, RoleState<Roles> {
  requestedRoute?: string;
  anonymousCredentials?: AnonymousCredentials;
}

/**
 * Check if anonymous user has given enough informations to access event
 * @param creds 
 * @param accessibility 
 * @returns 
 */
export function hasAnonymousIdentity(creds: AnonymousCredentials, accessibility: AccessibilityTypes) {
  const hasIdentity = !!creds?.lastName && !!creds?.firstName && !!creds?.role;
  return accessibility === 'public' ? hasIdentity : hasIdentity && !!creds?.email;
}

/**
 * Check if anonymous user has verified his email if event requires it
 * @param creds 
 * @param accessibility 
 * @returns 
 */
export function isAnonymousEmailVerified(creds: AnonymousCredentials, accessibility: AccessibilityTypes) {
  return accessibility === 'public' ? true : creds?.emailVerified && !!creds?.email;
}

export function hasVerifiedAnonymousIdentity(creds: AnonymousCredentials, accessibility: AccessibilityTypes) {
  return hasAnonymousIdentity(creds, accessibility) && isAnonymousEmailVerified(creds, accessibility);
}

export function createUser(user: Partial<User> = {}) {
  return {
    ...user,
    avatar: createStorageFile(user.avatar)
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
