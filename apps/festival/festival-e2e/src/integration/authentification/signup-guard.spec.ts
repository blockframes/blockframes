import {
  // plugins
  adminAuth,
  browserAuth,
  firestore,
  maintenance,
  // cypress commands
  get,
  check,
  uncheck,
  // cypress specific functions
  addNewCompany,
  fillCommonInputs,
} from '@blockframes/testing/cypress/browser';
import { newUser, newOrg} from '../../fixtures/authentification/signup';
import { USER_FIXTURES_PASSWORD } from '@blockframes/devops';

describe('Signup', () => {
  beforeEach(() => {
    cy.visit('');
    firestore.clearTestData();
    adminAuth.deleteAllTestUsers();
    browserAuth.clearBrowserAuth();
    cy.visit('auth/identity');
  });

  it('User cannot signup with an existing email', () => {
    maintenance.start();
    adminAuth.createUser({ uid: newUser.uid, email: newUser.email, emailVerified: true });
    firestore.create([{ [`users/${newUser.uid}`]: newUser }]);
    maintenance.end();
    cy.visit('auth/identity');
    get('cookies').click();
    fillCommonInputs(newUser);
    addNewCompany(newOrg);
    get('submit').click();
    get('existing-email').should('exist');
  });

  it('User cannot signup if any input is not valid, or checkbox unchecked', () => {
    //checks name and email inputs
    get('cookies').click();
    get('submit').should('be.disabled');
    get('email').type(newUser.email);
    get('first-name').type(newUser.firstName);
    get('last-name').type(newUser.lastName);
    get('org').type(newOrg.name);
    get('new-org').click();
    get('activity').click();
    get(`activity_${newOrg.activity}`).click();
    get('country').click();
    get(`option_${newOrg.addresses.main.country}`).click();
    get('role').contains('Buyer').click();
    get('password').type(USER_FIXTURES_PASSWORD);
    get('password-confirm').type(USER_FIXTURES_PASSWORD);
    check('terms');
    check('gdpr');
    get('submit').should('be.enabled');
    //email
    get('email').clear();
    get('submit').should('be.disabled');
    get('email').type('mail.beginning');
    get('submit').should('be.disabled');
    get('email').clear();
    get('email').type('@mail.ending.com');
    get('submit').should('be.disabled');
    get('email').clear();
    get('email').type('mail.withtout.domain@');
    get('submit').should('be.disabled');
    get('email').clear();
    get('email').type(newUser.email);
    get('submit').should('be.enabled');
    //firstname
    get('first-name').clear();
    get('submit').should('be.disabled');
    get('first-name').type(newUser.firstName);
    get('submit').should('be.enabled');
    //lastname
    get('last-name').clear();
    get('submit').should('be.disabled');
    get('last-name').type(newUser.lastName);
    get('submit').should('be.enabled');
    //checkboxes
    uncheck('terms');
    get('submit').should('be.disabled');
    check('terms');
    get('submit').should('be.enabled');
    uncheck('gdpr');
    get('submit').should('be.disabled');
    check('gdpr');
    get('submit').should('be.enabled');
  });

  it('User cannot signup if any organization input or list options is not completed', () => {
    get('cookies').click();
    get('submit').should('be.disabled');
    get('email').type(newUser.email);
    get('first-name').type(newUser.firstName);
    get('last-name').type(newUser.lastName);
    get('password').type(USER_FIXTURES_PASSWORD);
    get('password-confirm').type(USER_FIXTURES_PASSWORD);
    check('terms');
    check('gdpr');
    get('submit').should('be.disabled');
    //organization
    get('org').type(newOrg.name);
    get('new-org').click();
    get('submit').should('be.disabled');
    get('activity').click();
    get(`activity_${newOrg.activity}`).click();
    get('submit').should('be.disabled');
    get('country').click();
    get(`option_${newOrg.addresses.main.country}`).click();
    get('submit').should('be.disabled');
    get('role').contains('Buyer').click();
    get('submit').should('be.enabled');
  });

  it('User cannot signup with invalid password', () => {
    get('cookies').click();
    get('submit').should('be.disabled');
    get('email').type(newUser.email);
    get('first-name').type(newUser.firstName);
    get('last-name').type(newUser.lastName);
    get('org').type(newOrg.name);
    get('new-org').click();
    get('activity').click();
    get(`activity_${newOrg.activity}`).click();
    get('country').click();
    get(`option_${newOrg.addresses.main.country}`).click();
    get('role').contains('Buyer').click();
    check('terms');
    check('gdpr');
    get('submit').should('be.disabled');
    //password
    //too short
    get('password').type('short');
    get('password-confirm').type('short');
    get('submit').should('be.disabled');
    get('password').type('{selectall}{backspace}');
    get('password-confirm').type('{selectall}{backspace}');
    //too long
    get('password').type('ThisIsWayTooLongForAPassword');
    get('password-confirm').type('ThisIsWayTooLongForAPassword');
    get('submit').should('be.disabled');
    get('password').type('{selectall}{backspace}');
    get('password-confirm').type('{selectall}{backspace}');
    //unmatching
    get('password').type('LambdaPassword');
    get('password-confirm').type('OtherPassword');
    get('submit').should('be.disabled');
    get('password').type('{selectall}{backspace}');
    get('password-confirm').type('{selectall}{backspace}');
    //proper password
    get('password').type(USER_FIXTURES_PASSWORD);
    get('password-confirm').type(USER_FIXTURES_PASSWORD);
    get('submit').should('be.enabled');
  });
});
