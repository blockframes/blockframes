// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
import 'cypress-wait-until';
import 'cypress-mailosaur';

import firebase  from 'firebase/app';
import "firebase/auth";
import { firebase as firebaseConfig } from '@env';

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

const login = (email: string, password: string) => {
  return app.auth().signInWithEmailAndPassword(email, password);
}

const logout = () => {
  return app.auth().signOut();
}

Cypress.Commands.add('login', (email: string, password: string) => {
  return login(email, password);
})

Cypress.Commands.add('logout', () => {
  return logout();
})
