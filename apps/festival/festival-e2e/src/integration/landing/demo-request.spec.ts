/// <reference types="cypress" />

import { get, getInList, check, interceptEmail, deleteEmail, createFakeUserData, supportMailosaur } from 'libs/testing/e2e/src';
import { auth } from '@blockframes/testing/e2e';

const user = createFakeUserData();

describe('Demo Request Email', () => {
  beforeEach(() => {
    cy.visit('');
    auth.clearBrowserAuth();
  });

  it('Request demo email', () => {
    get('first-name').type(user.firstname);
    get('last-name').type(user.lastname);
    get('company').type(user.company.name);
    get('role').click();
    getInList('role_', user.role);
    get('demo-email').type(user.email);
    get('phone').children().children().as('phoneInputs');
    cy.get('@phoneInputs').first().type(user.indicator);
    cy.get('@phoneInputs').last().type(user.phone);
    check('checkbox-newsletters');
    get('submit-demo-request').click();
    interceptEmail({ sentTo: supportMailosaur }).then((mail) => deleteEmail(mail.id));
  });
});
