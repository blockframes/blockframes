/// <reference types="cypress" />

import { login } from '../../support/commands';

describe('Checking login with custom command', () => {
  before(() => {


  });

  it('Test for custom login', () => {
    //Check for emails sent
    cy.log("Checking log-in");
    const user = login("dev+troy-exl@blockframes.io", "blockframes");
    console.log(user);
  });

  it('Go Home', () => {
    cy.visit('/');
  })

});