import * as firebase from 'firebase/app';
import 'firebase/auth';
import { firebase as firebaseEnv } from '@env'
import { emulatorConfig } from '../../../festival/src/environment/environment'

const authEmulator = emulatorConfig.find(({ provider, value }) => provider === 'USE_AUTH_EMULATOR')

export function loginWithRandomUser() {
  return cy.task('getRandomUID').then(uid => {
    return cy.task('createUserToken', uid).then(async token => {
      const auth = firebase.default.initializeApp(firebaseEnv()).auth();
      if (authEmulator) auth.useEmulator('http://localhost:9099');
      return await auth.signInWithCustomToken(token as string)
    })
  })
}

export function clearBrowserAuth() {
  return indexedDB.deleteDatabase('firebaseLocalStorageDb');
}
