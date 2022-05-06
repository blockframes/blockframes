

//TODO define proper way to import next line #8071
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import {
  auth,
  get,
  getInList,
  check,
  uncheck,
  createFakeUserData
} from '@blockframes/testing/cypress/browser';
import { User, Organization } from '@blockframes/model';
import { USER_FIXTURES_PASSWORD } from '@blockframes/firebase-utils/anonymize/util';

const unfillingUser = createFakeUserData();

describe('Signup', () => {

  beforeEach(() => {
    cy.visit('');
    auth.clearBrowserAuth();
    cy.visit('auth/identity');
  });

  it('User cannot signup with an existing email', () => {
    cy.task('getRandomUser')
    .then((user: User) => {
      get('cookies').click();
      get('email').type(user.email);
      get('first-name').type(user.firstName);
      get('last-name').type(user.lastName);
      cy.task('getRandomOrg', { app: 'festival', access: { marketplace: true, dashboard: true } })
      .then((org: Organization) => {
        get('org').type(org.denomination.full);
        getInList('org_', org.denomination.full);
        get('password').type(USER_FIXTURES_PASSWORD);
        get('password-confirm').type(USER_FIXTURES_PASSWORD);
        check('terms');
        check('gdpr');
        get('submit').click();
        get('existing-email').should('exist');
      });
    });
  });

  it('User cannot signup if any input is not valid, or checkbox unchecked', () => {
    //checks name and email inputs
    const user = unfillingUser;
    get('cookies').click();
    get('submit').should('be.disabled');
    get('email').type(user.email);
    get('first-name').type(user.firstname);
    get('last-name').type(user.lastname);
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
    get('email').type(user.email);
    get('submit').should('be.enabled');
    //firstname
    get('first-name').clear();
    get('submit').should('be.disabled');
    get('first-name').type(user.firstname);
    get('submit').should('be.enabled');
    //lastname
    get('last-name').clear();
    get('submit').should('be.disabled');
    get('last-name').type(user.lastname);
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
    const user = unfillingUser;
    get('cookies').click();
    get('submit').should('be.disabled');
    get('email').type(user.email);
    get('first-name').type(user.firstname);
    get('last-name').type(user.lastname);
    get('password').type(user.password);
    get('password-confirm').type(user.password);
    check('terms');
    check('gdpr');
    get('submit').should('be.disabled');
    //organization
    get('org').type(user.company.name);
    get('new-org').click();
    get('submit').should('be.disabled');
    get('activity').click();
    getInList('activity_', user.company.activity);
    get('submit').should('be.disabled');
    get('activity').should('contain', user.company.activity);
    get('country').click();
    getInList('country_', user.company.country);
    get('submit').should('be.disabled');
    get('role').contains(user.role).click();
    get('submit').should('be.enabled');
  });

  it('User cannot signup with invalid password', () => {
    const user = unfillingUser;
    get('cookies').click();
    get('submit').should('be.disabled');
    get('email').type(user.email);
    get('first-name').type(user.firstname);
    get('last-name').type(user.lastname);
    get('org').type(user.company.name);
    get('new-org').click();
    get('activity').click();
    getInList('activity_', user.company.activity);
    get('activity').should('contain', user.company.activity);
    get('country').click();
    getInList('country_', user.company.country);
    get('country').should('contain', user.company.country);
    get('role').contains(user.role).click();
    check('terms');
    check('gdpr');
    get('submit').should('be.disabled');
    //password
    //too short
    get('password').type('short');
    get('password-confirm').type('short');
    get('submit').should('be.disabled');
    get('password').clear();
    get('password-confirm').clear();
    //too long
    get('password').type('ThisIsWayTooLongForAPassword');
    get('password-confirm').type('ThisIsWayTooLongForAPassword');
    get('submit').should('be.disabled');
    get('password').clear();
    get('password-confirm').clear();
    //unmatching
    get('password').type('LambdaPassword');
    get('password-confirm').type('OtherPassword');
    get('submit').should('be.disabled');
    get('password').clear();
    get('password-confirm').clear();
    //proper password
    get('password').type(user.password);
    get('password-confirm').type(user.password);
    get('submit').should('be.enabled');
  });
});
