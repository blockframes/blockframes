/// <reference types="cypress" />

import {
  clearDataAndPrepareTest,
  serverId,
  testEmail,
  SEC,
  get,
  getInList,
  check,
  assertUrl,
  interceptMail,
  createEmail,
  createOrgName
} from '@blockframes/e2e/utils';

const user = {
  firstName: 'John',
  lastName: 'Doe',
  email: createEmail(),
  company: createOrgName(),
  role: 'Buyer',
  indicator: '+33',
  phone: '123456789'
}

//Test if email is sent correctly.
const SUBJECT_DEMO = 'A demo has been requested';

describe('Demo Request Email', () => {

  beforeEach(() => {
    clearDataAndPrepareTest('/');
    //TODO : Clearing message to be changed for a retrieval from a starting time
    //Clear all messages on server before the test
    cy.mailosaurDeleteAllMessages(serverId).then(() => {
      cy.log('Inbox empty. Ready to roll..');
    });
  });

  it('Request demo email', () => {
    get('first-name').type(user.firstName);
    get('last-name').type(user.lastName);
    get('company').type(user.company);
    get('role').click();
    getInList('role_', user.role);
    get('demo-email').type(user.email);
    get('phone').children().children().as('phoneInputs');
    cy.get('@phoneInputs').first().type(user.indicator);
    cy.get('@phoneInputs').last().type(user.phone);
    check('checkbox-newsletters');
    get('submit-demo-request').click()

    //TODO : old code below, to be updated

    cy.wait(15 * SEC);

    //Test for arrival of email..
    cy.mailosaurGetMessage(
      serverId,
      {
        sentTo: testEmail,
      },
      {
        timeout: 20 * SEC,
      }
    ).then((email) => {
      expect(email.subject).to.equal(SUBJECT_DEMO);
      cy.log(email.text.body);
      cy.mailosaurDeleteMessage(email.id);
    });
  });
});
