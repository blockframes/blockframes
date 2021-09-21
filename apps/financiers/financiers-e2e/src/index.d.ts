import type firebase from 'firebase/app';

// Must be declared global to be detected by typescript (allows import/export)
// eslint-disable @typescript/interface-name
declare global {
  namespace Cypress {
    interface Chainable<Subject> {
      login(email: string, password: string): Chainable<firebase.auth.UserCredential>;
      logout(): Chainable<void>;
    }
  }
}
