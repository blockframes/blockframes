import type firebase from 'firebase/app';

declare namespace Cypress {
  interface Chainable<Subject> {
    login(email: string, password: string): Chainable<firebase.auth.UserCredential>;
    logout(): Chainable<void>;
  }
}
