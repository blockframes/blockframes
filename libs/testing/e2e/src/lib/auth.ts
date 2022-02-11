import type { AuthService } from '@blockframes/auth/+state';
import { USER_FIXTURES_PASSWORD } from '@blockframes/firebase-utils/anonymize/util';

export function loginWithUID(uid: string) {
  return cy.task('createUserToken', uid).then(token => {
    cy.window().should('have.property', 'LoginService');
    return cy.window().then((w) => {
      const authService = w['LoginService'] as AuthService;
      return authService.signin(token as string);
    })
  })
}

export function loginWithEmailAndPassword(email: string) {
  cy.window().should('have.property', 'LoginService');
  return cy.window().then((w) => {
    const authService = w['LoginService'] as AuthService;
    return authService.signin(email, USER_FIXTURES_PASSWORD);
  })
}

export function loginWithRandomUser(method: 'token' | 'emailAndPassword' = 'token') {
  if (method === 'token') {
    return cy.task('getRandomUID').then(loginWithUID)
  } else {
    return cy.task('getRandomEmail').then(loginWithEmailAndPassword)
  }
}

/**
 * Currently not working as custom claims don't show up in the JWT token
 * @deprecated
 * @param email
 * @returns
 */
export function loginWithEmail(email: string) {
  return cy.task('getUIDFromEmail', email).then(loginWithUID);
}

export function clearBrowserAuth() {
  cy.window().should('have.property', 'LoginService');
  cy.window().then(async (w) => {
    await w['LoginService'].signOut();
    indexedDB.deleteDatabase('firebaseLocalStorageDb');
  })
}
