import type { AuthService } from '@blockframes/auth/+state';

export function loginWithUID(uid: string) {
  return cy.task('createUserToken', uid).then(token => {
    cy.window().should('have.property', 'LoginService');
    return cy.window().then((w) => {
      const authService = w['LoginService'] as AuthService;
      return authService.signin(token as string);
    })
  })
}

export function loginWithRandomUser() {
  return cy.task('getRandomUID').then((uid: string) => {
    return loginWithUID(uid);
  })
}

export function loginWithEmail(email: string) {
  return cy.task('getUIDFromEmail', email).then((uid: string) => {
    return loginWithUID(uid);
  })
}

export function clearBrowserAuth() {
  cy.window().should('have.property', 'LoginService');
  cy.window().then(async (w) => {
    await w['LoginService'].signOut();
    indexedDB.deleteDatabase('firebaseLocalStorageDb');
  })
}
