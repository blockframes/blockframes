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

import Users from '../../../../../tools/fixtures/users.json'


declare namespace Cypress {
  interface Chainable<Subject> {
    login(email: string, password: string): void;
    getFixture(type: string, key: string, value: any): any;
  }
}
//
// -- This is a parent command --
Cypress.Commands.add('login', (email, password) => {
  console.log('Custom command example: Login', email, password);
});

Cypress.Commands.add('getFixture', (type: string, key: string, value: any) => {
  console.log('Getting Fixture', type );
  const data = [Users];
  let ret;

  switch (type) {
  case 'user':
    ret = data[0];
    break;
  }

  return ret[0];
});


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
