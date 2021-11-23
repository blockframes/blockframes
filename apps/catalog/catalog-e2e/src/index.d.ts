import { App } from '@blockframes/utils/apps';
import type firebase from 'firebase/app';

declare namespace Cypress {
  interface Chainable<Subject> {
    login(email: string, password: string): Chainable<firebase.auth.UserCredential>;
    logout(): Chainable<void>;
    acceptMovieById(app: App, movieId: string): Chainable<Promise<void>>;
  }
}
