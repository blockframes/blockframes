/// <reference types="cypress" />

//Test if email is sent correctly.

describe('Check spinner wait until', () => {
  //death-pink@zjfwnf90.mailosaur.net
  const serverId = 'zjfwnf90'; // Replace SERVER_ID with an actual Mailosaur Server ID
  const testEmail = `test@${serverId}.mailosaur.net`;
  let passwordResetLink = '';

  beforeEach(() => {
    cy.visit('/');
  });
  
  it.only('Wait for API to load', () => {
    cy.get('h1', {timeout: 10000})
      .contains("Want to learn more?");

    //cy.get('[test-id="screening-spinner"]', {timeout: 10000})
    //  .should('not.exist');

    //Test for arrival of email..
    cy.mailosaurGetMessage(serverId, {
      sentTo: testEmail
    }).then(email => {
      expect(email.subject).to.equal('Reset your password');
      passwordResetLink = email.text.links[0].href;
      cy.log(passwordResetLink);
    })

  });

  it('Wait for API to load', () => {
    //Test for an page element
    cy.get('h1', {timeout: 10000}).contains("Screening List2");
    //Test if spinner has gone
    cy.get('[test-id="screening-spinner"]', {timeout: 10000})
      .should('not.exist');
  });
});