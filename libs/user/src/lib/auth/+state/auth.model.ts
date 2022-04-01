import { Person } from '@blockframes/shared/model';
import { AccessibilityTypes } from '@blockframes/shared/model';

export type AnonymousRole = 'guest' | 'organizer'; // Role for events

export interface AnonymousCredentials extends Person {
  uid: string;
  role?: AnonymousRole;
  email?: string;
  invitationId?: string; // Invitation for the event
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
