/// <reference types="cypress" />

import { setForm } from "@blockframes/e2e/utils";

//Test if email is sent correctly.
const SUBJECT_DEMO = 'A demo has been requested';

describe('Check spinner wait until', () => {
  //death-pink@zjfwnf90.mailosaur.net
  const serverId = 'zjfwnf90'; // Replace SERVER_ID with an actual Mailosaur Server ID
  const testEmail = `test@${serverId}.mailosaur.net`;
  const demo_contact = {
    'first-name': 'Reed',
    'last-name': 'Hastings',
    'comp-name': 'Netflicks',
    'role': 'Buyer',
    'email': 'reed@netflicks.zz',
    'country': '+33',
    'tel': '123456789'
  }
  beforeEach(() => {
    cy.visit('/');

    //Clear all messages on server before the test
    cy.mailosaurDeleteAllMessages(serverId).then(() => {
      cy.log('Inbox empty. Ready to roll..');
    })
  });
  
  it.only('Wait for API to load', () => {
    cy.get('h1', {timeout: 10000})
      .contains("Want to learn more?");

    cy.log('Trigger send demo request email..');

    setForm('festival-landing #demo input, mat-select', {inputValue: demo_contact});
    cy.get('[test-id="phone-no"] .first', {timeout: 1000}).type(demo_contact.country)
    cy.get('[test-id="phone-no"] .last', {timeout: 1000}).type(demo_contact.tel)

    cy.get('button[test-id="send-request"]', {timeout: 10000})
      .click()
      .then(() => cy.log("Form clicked!"));

    cy.wait(15000);

    //Test for arrival of email..
    cy.mailosaurGetMessage(serverId, {
      sentTo: testEmail
    }).then(email => {
      expect(email.subject).to.equal('A demo has been requested');
      cy.log(email.text.body);
      cy.mailosaurDeleteMessage(email.id);
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