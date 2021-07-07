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
//
import 'cypress-mailosaur';

import { AuthService } from '@blockframes/auth/+state/auth.service';

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

Cypress.Commands.add("login", async (email, password) => { 
  try {
    //await AuthService.signin(email, password);
    cy.window().should('have.property', 'AuthService')
    cy.window()
      .then(async (w) => {
        const authService = w['AuthService'];
        await authService.signin({ email, password });
        cy.log(`Logged in user: ${email}`);
      });
    cy.window().should('have.property', 'LoggedIn')
  } catch (e) {
    cy.log(`Login Err: ${e}`);
  }
})