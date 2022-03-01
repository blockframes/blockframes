/// <reference types="cypress" />

import { get, getInList, check, assertUrl, interceptMail } from '@blockframes/e2e/utils';
import { newUserWithNewOrg } from '@blockframes/e2e/fixtures/login';
import { serverId } from '@blockframes/e2e/utils';

describe('Signup', () => {

  const user = newUserWithNewOrg;

  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    indexedDB.deleteDatabase('firebaseLocalStorageDb');
    cy.mailosaurDeleteAllMessages(serverId);
    cy.visit('auth/identity');
  });

  it('User from new company can signup', () => {
    get('cookies').click();
    get('email').type(user.email);
    get('first-name').type(user.firstName);
    get('last-name').type(user.lastName);
    get('org').type(user.company.name);
    get('new-org').click();
    get('activity').click();
    getInList('activity_', user.company.activity);
    get('activity').should('contain', user.company.activity);
    get('country').click();
    getInList('country_', user.company.country);
    get('country').should('contain', user.company.country);
    get('role').contains(user.role).click();
    get('password').type(user.password);
    get('password-confirm').type(user.password);
    check('terms');
    check('gdpr');
    get('submit').click()
      .then(() => interceptMail({ recipient: user.email }).then((res) => console.log('userVerifMail :', res)))
      .then(() => interceptMail({ partialSubject: user.company.name }).then((res) => console.log('orgVerifMail :', res)))
      // below intercept is not useful here, but is kept to serve as an example
      .then(() => interceptMail({ partialBody: `${user.firstName} ${user.lastName}` }).then((res) => console.log('supportMail :', res))
      )
      .then(() => console.log('all mails arrived'));
    cy.log('all mails ok');
    assertUrl('c/organization/create-congratulations');
    get('profile-data-ok').should('exist');
    get('org-data-ok').should('exist');
    get('email-pending').should('exist');
    get('org-approval-pending').should('exist');
    cy.log('waiting for user confirmation and organisation approval');
  });

  //TODO : code other possibilities - issue #7751
});
