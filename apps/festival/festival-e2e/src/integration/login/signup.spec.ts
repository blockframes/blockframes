/// <reference types="cypress" />

import {
  get,
  getInList,
  check,
  assertUrl,
  interceptEmail,
  deleteEmail,
  assertUrlIncludes,
} from '@blockframes/e2e/utils';
import { createUserArray, capitalize } from '@blockframes/e2e/utils';
import { Organization } from '@blockframes/organization/+state';
import { orgActivity } from '@blockframes/utils/static-model/static-model';
import { territories } from '@blockframes/utils/static-model';

let users = [];

describe('Signup', () => {

  before('Define users', async () => {
    users = await createUserArray(3);
  })
  
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    indexedDB.deleteDatabase('firebaseLocalStorageDb');
    cy.visit('auth/identity');
  });

  it('User from new company can signup', () => {
    const user = users[0];
    get('cookies').click();
    get('email').type(user.email);
    get('first-name').type(user.name.first);
    get('last-name').type(user.name.last);
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
    get('submit').click();
    interceptEmail({ sentTo: user.email })
      .then((mail) => deleteEmail(mail.id));
    interceptEmail({ subject: `Archipel Market - ${user.company.name} was created and needs a review` })
      .then((mail) => deleteEmail(mail.id));
    interceptEmail({ body: `${user.email}` })
      .then((mail) => deleteEmail(mail.id));
    cy.log('all mails received');
    assertUrl('c/organization/create-congratulations');
    get('profile-data-ok').should('exist');
    get('org-data-ok').should('exist');
    get('email-pending').should('exist');
    get('org-approval-pending').should('exist');
    cy.log('waiting for user confirmation and organisation approval');
    cy.task('validateOrg', user.company.name)
      .then(() => cy.log('Org validated'));
    get('org-approval-ok').should('exist');
    cy.task('validateAuthUser', user.email)
      .then(() => cy.log('User validated'));
    get('email-ok').should('exist');
    get('refresh').click();
    assertUrlIncludes('c/o/marketplace/home');
    get('skip-preferences').click();
  });

  it('User from a known organization with access to festival marketplace can signup', () => {
    const user = users[1];
    cy.task('getRandomOrg', { application: 'festival', access: 'marketplace' }).then(
      (org: Organization) => {
        get('cookies').click();
        get('email').type(user.email);
        get('first-name').type(user.name.first);
        get('last-name').type(user.name.last);
        get('org').type(org.denomination.full);
        getInList('org_', org.denomination.full);
        get('activity').should('contain', orgActivity[org.activity]);
        get('country').should('contain', capitalize(territories[org.addresses.main.country]));
        get('password').type(user.password);
        get('password-confirm').type(user.password);
        check('terms');
        check('gdpr');
        get('submit').click();
        interceptEmail({ sentTo: user.email })
          .then((mail) => deleteEmail(mail.id));
        interceptEmail({ body: `${user.email}` })
          .then((mail) => deleteEmail(mail.id));
        cy.log('all mails received');
        assertUrl('c/organization/join-congratulations');
        get('profile-data-ok').should('exist');
        get('org-data-ok').should('exist');
        get('email-pending').should('exist');
        get('org-approval-pending').should('exist');
        cy.log('waiting for user confirmation and organisation approval');
        cy.task('validateAuthUser', user.email)
          .then(() => cy.log('User validated'));
        get('email-ok').should('exist');
        cy.task('acceptUserInOrg', user.email)
          .then(() => cy.log('User accepted in org'));
        get('org-approval-ok').should('exist');
        get('refresh').click();
        assertUrlIncludes('c/o/marketplace/home');
        get('skip-preferences').click();
      }
    );
  });

  it('User from a known organization with access to festival dashboard can signup', () => {
    const user = users[2];
    cy.task('getRandomOrg', { application: 'festival', access: 'dashboard' }).then(
      (org: Organization) => {
        get('cookies').click();
        get('email').type(user.email);
        get('first-name').type(user.name.first);
        get('last-name').type(user.name.last);
        get('org').type(org.denomination.full);
        getInList('org_', org.denomination.full);
        get('activity').should('contain', orgActivity[org.activity]);
        get('country').should('contain', capitalize(territories[org.addresses.main.country]));
        get('password').type(user.password);
        get('password-confirm').type(user.password);
        check('terms');
        check('gdpr');
        get('submit').click();
        interceptEmail({ sentTo: user.email })
          .then((mail) => deleteEmail(mail.id));
        interceptEmail({ body: `${user.email}` })
          .then((mail) => deleteEmail(mail.id));
        cy.log('all mails received');
        assertUrl('c/organization/join-congratulations');
        get('profile-data-ok').should('exist');
        get('org-data-ok').should('exist');
        get('email-pending').should('exist');
        get('org-approval-pending').should('exist');
        cy.log('waiting for user confirmation and organisation approval');
        cy.task('validateAuthUser', user.email)
          .then(() => cy.log('User validated'));
        get('email-ok').should('exist');
        cy.task('acceptUserInOrg', user.email)
          .then(() => cy.log('User accepted in org'));
        get('org-approval-ok').should('exist');
        get('refresh').click();
        assertUrlIncludes('c/o/dashboard/home');
      }
    );
  });

  //TODO : code other possibilities - issue #7751
  // try to signup with a known mail => fail
  // try not to fill each input alternatively => fail
  // try to fill input with wrong values => fail (ex : mail with é or ç, short password, no matching password, etc...)
});
