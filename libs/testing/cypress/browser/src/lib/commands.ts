// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace Cypress {
  interface Chainable<Subject> {
    getId(selector: string): Chainable<Subject>;
    logSubject(): Chainable<Subject>;
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

Cypress.Server.defaults({
  delay: 500,
  force404: false,
  ignore: () => {
    // handle custom logic for whitelisting
    return true;
  },
});

Cypress.config('defaultCommandTimeout', 60000);

/**
 * This command is like the get command above but chainable!
 */
// // eslint-disable-next-line @typescript-eslint/ban-ts-comment
// // @ts-ignore
Cypress.Commands.add('getId', { prevSubject: 'optional' }, (subject: Cypress.Chainable, selector: string) => {
  return subject ? subject.get(`[test-id="${selector}"]`) : cy.get(`[test-id="${selector}"]`);
});

Cypress.Commands.add('logSubject', { prevSubject: ['document', 'element', 'optional', 'window'] }, subject => {
  cy.log(subject as unknown as string);
});
