/// <reference types="cypress" />

import { serverId, testEmail } from "@blockframes/e2e/utils";
import { MessageListResult } from "cypress-mailosaur";

const subjects = [
  "A new organization has been created",
  "New user connexion",
  "Archipel Content - Email address verification"
];

describe('User can create new account and create a new organization', () => {
  beforeEach(() => {
    //Clear all messages on server before the test
    // cy.mailosaurDeleteAllMessages(serverId).then(() => {
    //   cy.log('Inbox empty. Ready to roll..');
    // })
  });

  it('Check emails are sent properly', () => {
    //Check for emails sent
    cy.mailosaurSearchMessages(serverId, {
      sentTo: testEmail
    }).then((result: MessageListResult) => {
      //expect(email.subject).to.equal(SUBJECT_DEMO);
      //cy.log(email.text.body);
      //cy.mailosaurDeleteMessage(email.id);
      cy.log(JSON.stringify(result));
      console.log(result)
      const messages = result.items;
      messages.forEach(email => {
        expect(subjects).to.include.members([email.subject]);
      });
    });
  });

});