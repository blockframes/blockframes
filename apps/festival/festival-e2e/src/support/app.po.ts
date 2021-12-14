// import firebase from 'firebase/app';
// import 'firebase/auth';
import { firebase as firebaseEnv } from '@env'
import { emulatorConfig } from '../../../festival/src/environment/environment'
import type { AuthService } from '@blockframes/auth/+state';

// const authEmulator = emulatorConfig.find(({ provider, value }) => provider === 'USE_AUTH_EMULATOR')
// let auth: firebase.auth.Auth;
// if (!auth) {
//   auth = firebase.initializeApp(firebaseEnv(), 'testEnv').auth();
//   auth.useEmulator('http://localhost:9099');
// }
// return await auth.signInWithCustomToken(token as string)

export function loginWithRandomUser() {
  return cy.task('getRandomUID').then(uid => {
    return cy.task('createUserToken', uid).then(token => {
      return cy.window().then(async (w) => {
        const authService = w['LoginService'] as AuthService;
        return authService.signin(token as string);
      })
    })
  })
}

export function loginWithUID(uid: string) {
  return cy.task('createUserToken', uid).then(token => {
    return cy.window().then(async (w) => {
      const authService = w['LoginService'] as AuthService;
      return authService.signin(token as string);
    })
  })
}

export function clearBrowserAuth() {
  cy.window().should('have.property', 'LoginService');
  cy.window().then(async (w) => {
    await w['LoginService'].signOut();
  })
  return indexedDB.deleteDatabase('firebaseLocalStorageDb');
}
