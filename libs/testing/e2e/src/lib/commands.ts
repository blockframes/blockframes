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

// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace Cypress {
  interface Chainable<Subject> {
    login(email: string, password: string): void;
    logSubject(msg?: string): Cypress.Chainable<Subject>;
  }
}
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => {
//   console.log('Custom command example: Login', email, password);
// });
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

Cypress.Commands.add('logSubject', { prevSubject: 'optional' }, (subject, msg?: string) => {
  if (msg) cy.log(msg);
  if (subject) console.dir(subject)
  if (subject) cy.log(subject);
});

Cypress.Server.defaults({
  delay: 500,
  force404: false,
  ignore: (xhr) => {
    // handle custom logic for whitelisting
    return true;
  }
})
