// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
import 'cypress-mailosaur';

import firebase  from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import { firebase as firebaseConfig } from '@env';
import { App } from 'libs/utils/src/lib/apps';

// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

//Init the app
const app = firebase.initializeApp(firebaseConfig('catalog'));
const auth = app.auth();
const db = app.firestore();

const login = (email: string, password: string) => {
  return auth.signInWithEmailAndPassword(email, password);
}

const logout = () => {
  return auth.signOut();
}

const acceptMovieById = (appName: App, movieId: string) => {
  const movieRef = db.collection('movies').doc(movieId);
  return movieRef.update(`app.${appName}`, {
    access: true,
    status: 'accepted',
    refusedAt: null,
    acceptedAt: firebase.firestore.FieldValue.serverTimestamp(),
  });
};

Cypress.Commands.add('login', (email: string, password: string) => {
  return login(email, password);
});

Cypress.Commands.add('logout', () => {
  return logout();
});

Cypress.Commands.add('acceptMovieById', (app: App, movieId: string) => {
  return acceptMovieById(app, movieId);
});
