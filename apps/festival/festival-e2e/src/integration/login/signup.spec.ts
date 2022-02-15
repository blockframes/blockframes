/// <reference types="cypress" />

import { serverId } from '@blockframes/e2e/utils';
import { supportEmails } from '@env';


//TODO : move functions inside a library
function get(selector: string) {
  return cy.get(`[test-id="${selector}"]`);
}

function getAllStartingWith(selector: string) {
  return cy.get(`[test-id^="${selector}"]`);
}

function getInList(selectorStart: string, option: string) {
  getAllStartingWith(selectorStart).each(($el) => {
    // loops between all activity options
    if ($el[0].innerText === option) $el.trigger('click');
  });
}

function check(selector: string) {
  get(selector).find('[type="checkbox"]').check({ force: true });
}

function createEmail(username: string = 'testUser', domain: string = serverId + '.mailosaur.net') {
  return username + Date.now() + '@' + domain;
}

function createOrgName(orgName: string = 'testOrg') {
  return orgName + Date.now();
}


describe('Signup', () => {
  const user = {
    email: createEmail(),
    firstName: 'Nick',
    lastName: 'Casc',
    country: 'France',
    password: 'Test01',
    company: {
      name: createOrgName(),
      activity: 'Organization',
      country: 'France',
    },
    role: 'Buyer',
  };

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
    getAllStartingWith('country_');
    get('country').should('contain', user.company.country);
    get('role').contains(user.role).click();
    get('password').type(user.password);
    get('confirm').type(user.password);
    check('terms');
    check('gdpr');
    get('submit').click();
    //! Find a way to avoid wait
    cy.wait(10000)
    cy.mailosaurGetMessage(serverId, {sentTo: user.email})
      .then(res => console.log('user', res))
    cy.mailosaurGetMessage(serverId, {sentTo: supportEmails.mailosaur})
      .then(res => console.log('support', res))

    //TODO : use activivation links from mailosaur emails
  });

  //TODO : code other possibilities
  //* User from known company
  //* Buyer & Sales agent
  //from notion :
  /* Fill in all fields except one - do this for all available fields (fail)
  Fill in an already used email address (fail)
  Fill in an wrongly formatted email address (fail)
  Fill in different passwords in the password and confirm password field (fail)
  Fill in a password containing less than 6 characters (fail)
  Fill in a password containing more than 24 characters (fail)
  Fill in all fields correctly (pass) */
});
