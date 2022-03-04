/// <reference types="cypress" />

import { get, getInList, check, assertUrl, interceptEmail, deleteEmail, assertUrlIncludes } from '@blockframes/e2e/utils';
import { newUserWithNewOrg } from '@blockframes/e2e/fixtures/login';
import { login } from 'libs/e2e/src/lib/utils/commands'
import { firebase as config} from '@env'
import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore';


describe('Signup', () => {

  const user = newUserWithNewOrg;

  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    indexedDB.deleteDatabase('firebaseLocalStorageDb');
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
    get('submit').click();
    interceptEmail({sentTo: user.email})
      //.then(mail => deleteEmail(mail.id))
    interceptEmail({subject: `Archipel Market - ${user.company.name} was created and needs a review`})
      .then(mail => deleteEmail(mail.id));
    interceptEmail({body: `${user.firstName}`})
      .then(mail => deleteEmail(mail.id))
    cy.log('all mails received');
    assertUrl('c/organization/create-congratulations');
    get('profile-data-ok').should('exist');
    get('org-data-ok').should('exist');
    get('email-pending').should('exist');
    get('org-approval-pending').should('exist');
    cy.log('waiting for user confirmation and organisation approval');
    cy.task('validateOrg', user.company.name)
      .then(x => console.log(x))
    cy.task('validateUser', user.email)
      .then(async (x) => {
        console.log(x)
        get('email-ok').should('exist');
        get('refresh').click();
        get('skip-preferences').click();
      })
    
  });

  //TODO : code other possibilities - issue #7751
});
