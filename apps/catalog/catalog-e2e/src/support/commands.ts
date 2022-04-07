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
import '@angular/compiler';
import 'cypress-mailosaur';
import { App } from 'libs/utils/src/lib/apps';
import { getAuth, signInWithEmailAndPassword, signOut } from '@angular/fire/auth';
import { doc, getFirestore, serverTimestamp, updateDoc } from '@angular/fire/firestore';

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

const login = (email: string, password: string) => {
  return signInWithEmailAndPassword(getAuth(), email, password);
}

const logout = () => {
  return signOut(getAuth());
}

const acceptMovieById = (appName: App, movieId: string) => {
  const db = getFirestore();
  const movieRef = doc(db, `movies/${movieId}`);
  return updateDoc(movieRef, `app.${appName}`, {
    access: true,
    status: 'accepted',
    refusedAt: null,
    acceptedAt: serverTimestamp(),
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
