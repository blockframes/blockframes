/// <reference types="cypress" />

import {
  clearDataAndPrepareTest,
  testEmail,
  get,
  getInList,
  check,
  interceptEmail,
  deleteEmail,
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

describe('Demo Request Email', () => {

  beforeEach(() => {
    clearDataAndPrepareTest('/');
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
    interceptEmail({ sentTo: testEmail })
      .then((mail) => deleteEmail(mail.id));
  });
});
