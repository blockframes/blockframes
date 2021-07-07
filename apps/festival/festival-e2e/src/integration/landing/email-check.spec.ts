/// <reference types="cypress" />

import { clearDataAndPrepareTest, setForm, serverId, testEmail, SEC } from "@blockframes/e2e/utils";

//Test if email is sent correctly.
const SUBJECT_DEMO = 'A demo has been requested';

describe('Demo Request Email', () => {
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
    clearDataAndPrepareTest('/');

    //Clear all messages on server before the test
    cy.mailosaurDeleteAllMessages(serverId).then(() => {
      cy.log('Inbox empty. Ready to roll..');
    })
  });
  
  it('Request Demo and verify request email', () => {
    //Wait long enough for page to load
    cy.get('a[href="/auth/identity"]', {timeout: 60 * SEC});

    cy.get('h1', {timeout: 10 * SEC})
      .contains("Want to learn more?");

    cy.log('Trigger send demo request email..');

    setForm('festival-landing #demo input, mat-select', {inputValue: demo_contact});
    cy.get('[test-id="phone-no"] .first', {timeout: 1 * SEC}).type(demo_contact.country)
    cy.get('[test-id="phone-no"] .last', {timeout: 1 * SEC}).type(demo_contact.tel)

    cy.get('button[test-id="send-request"]', {timeout: 10 * SEC})
      .click()
      .then(() => cy.log("Form clicked!"));

    cy.wait(15 * SEC);

    //Test for arrival of email..
    cy.mailosaurGetMessage(serverId, {
      sentTo: testEmail
    }).then(email => {
      expect(email.subject).to.equal(SUBJECT_DEMO);
      cy.log(email.text.body);
      cy.mailosaurDeleteMessage(email.id);
    })

  });
});