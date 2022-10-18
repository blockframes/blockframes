/// <reference types="cypress" />

import type { AuthService } from '@blockframes/auth/service';
import { USER_FIXTURES_PASSWORD } from '@blockframes/devops';

export const browserAuth = {
  signinWithEmailAndPassword(email: string) {
    cy.window().should('have.property', 'LoginService');
    return cy.window().then(w => {
      const authService = w['LoginService'] as AuthService;
      return authService.signin(email, USER_FIXTURES_PASSWORD);
    });
  },

  clearBrowserAuth() {
    cy.window().should('have.property', 'LoginService');
    return cy.window().then(async w => {
      await w['LoginService'].signout();
      const databases = await indexedDB.databases();
      return Promise.all(databases.map(db => indexedDB.deleteDatabase(db.name)));
    });
  },

  getAuth() {
    cy.window().should('have.property', 'LoginService');
    return cy.window().then(w => w['LoginService'] as AuthService);
  },
};
