/// <reference types="cypress" />



describe('Checking login with custom command', () => {
  beforeEach(() => {
    //Clear all messages on server before the test
    // cy.mailosaurDeleteAllMessages(serverId).then(() => {
    //   cy.log('Inbox empty. Ready to roll..');
    // })
    cy.visit('/');
  });

  it('Test for custom login', () => {
    //Check for emails sent
    cy.log("Checking log-in");
    cy.login("dev+troy-exl@blockframes.io", "blockframes")
      .then((user) => {
        cy.log(JSON.stringify(user));
        console.log(user);
      });
    cy.window().should('have.property', 'LoggedIn');
  });

});