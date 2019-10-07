/// <reference types="cypress" /> 

export default class WelcomeViewPage {
    constructor() {
      cy.get('[page-id=welcome-view]', {timeout: 10000});
    }
  
    public clickCallToAction() {
      cy.get('[page-id=welcome-view] [test-id=call-to-action]').click();
    }
  }