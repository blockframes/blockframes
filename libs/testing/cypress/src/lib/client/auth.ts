/// <reference types="cypress" />

import type { AuthService } from '@blockframes/auth/+state';
import { USER_FIXTURES_PASSWORD } from '@blockframes/firebase-utils/anonymize/util';

export function loginWithEmailAndPassword(email: string) {
  cy.window().should('have.property', 'LoginService');
  return cy.window().then((w) => {
    const authService = w['LoginService'] as AuthService;
    return authService.signin(email, USER_FIXTURES_PASSWORD);
  });
}

export function loginWithRandomUser() {
  return cy.task('getRandomEmail').then((email: string) => loginWithEmailAndPassword(email));
}

export function clearBrowserAuth() {
  cy.window().should('have.property', 'LoginService');
  cy.window().then(async (w) => {
    await w['LoginService'].signOut();
    indexedDB.deleteDatabase('firebaseLocalStorageDb');
  });
}
