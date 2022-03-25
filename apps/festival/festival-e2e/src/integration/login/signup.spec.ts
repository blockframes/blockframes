

//TODO define proper way to import next line #8071
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import {
  auth,
  get,
  getInList,
  check,
  uncheck,
  assertUrl,
  interceptEmail,
  deleteEmail,
  assertUrlIncludes,
  createFakeUserDataArray
} from '@blockframes/testing/cypress/client';
import { capitalize } from '@blockframes/utils/helpers';
import { User, Organization } from '@blockframes/model';
import { orgActivity, territories } from '@blockframes/utils/static-model/static-model';
import { USER_FIXTURES_PASSWORD } from '@blockframes/firebase-utils/anonymize/util';

const [newOrgUser, knownMarketplaceOrgUser, knownDashboardOrgUser, unfillingUser] = createFakeUserDataArray(4);

describe('Signup', () => {

  beforeEach(() => {
    cy.visit('');
    auth.clearBrowserAuth();
    cy.visit('auth/identity');
  });

  it('User from new company can signup', () => {
    const user = newOrgUser;
    get('cookies').click();
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
    const user = knownMarketplaceOrgUser;
    cy.task('getRandomOrg', { app: 'festival', access: { marketplace: true, dashboard: false } }).then((org: Organization) => {
      get('cookies').click();
      get('email').type(user.email);
      get('first-name').type(user.firstname);
      get('last-name').type(user.lastname);
      get('org').type(org.denomination.full);
      getInList('org_', org.denomination.full);
      get('activity').should('contain', orgActivity[org.activity]);
      get('country').should('contain', capitalize(territories[org.addresses.main.country]));
      get('password').type(user.password);
      get('password-confirm').type(user.password);
      check('terms');
      check('gdpr');
      get('submit').click();
      interceptEmail({ sentTo: user.email }).then(mail => deleteEmail(mail.id));
      interceptEmail({ body: `${user.email}` }).then(mail => deleteEmail(mail.id));
      cy.log('all mails received');
      assertUrl('c/organization/join-congratulations');
      get('profile-data-ok').should('exist');
      get('org-data-ok').should('exist');
      get('email-pending').should('exist');
      get('org-approval-pending').should('exist');
      cy.log('waiting for user confirmation and organisation approval');
      cy.task('validateAuthUser', user.email).then(() => cy.log('User validated'));
      get('email-ok').should('exist');
      cy.task('acceptUserInOrg', user.email).then(() => cy.log('User accepted in org'));
      get('org-approval-ok').should('exist');
      get('refresh').click();
      assertUrlIncludes('c/o/marketplace/home');
      get('skip-preferences').click();
      //Checks if an admin of this org received the inApp invitation
      cy.task('getRandomOrgAdmin', org.id).then((admin: User) => {
        get('auth-user').click();
        get('auth-logout').click();
        get('login').click();
        assertUrlIncludes('auth/connexion');
        get('email').type(admin.email);
        get('password').type(USER_FIXTURES_PASSWORD);
        get('submit').click();
        assertUrlIncludes('marketplace/home');
        if (!admin.preferences) get('skip-preferences').click();
        get('invitations-link').click();
        get('invitation').first().should('contain', `${user.firstname} ${user.lastname} wants to join your organization.`);
        get('invitation-status').first().should('contain', 'Accepted');
      });
    });
  });

  it('User from a known organization with access to festival dashboard can signup', () => {
    const user = knownDashboardOrgUser;
    cy.task('getRandomOrg', { app: 'festival', access: { marketplace: true, dashboard: true } })
    .then((org: Organization) => {
      get('cookies').click();
      get('email').type(user.email);
      get('first-name').type(user.firstname);
      get('last-name').type(user.lastname);
      get('org').type(org.denomination.full);
      getInList('org_', org.denomination.full);
      get('activity').should('contain', orgActivity[org.activity]);
      get('country').should('contain', capitalize(territories[org.addresses.main.country]));
      get('password').type(user.password);
      get('password-confirm').type(user.password);
      check('terms');
      check('gdpr');
      get('submit').click();
      interceptEmail({ sentTo: user.email }).then(mail => deleteEmail(mail.id));
      interceptEmail({ body: `${user.email}` }).then(mail => deleteEmail(mail.id));
      cy.log('all mails received');
      assertUrl('c/organization/join-congratulations');
      get('profile-data-ok').should('exist');
      get('org-data-ok').should('exist');
      get('email-pending').should('exist');
      get('org-approval-pending').should('exist');
      cy.log('waiting for user confirmation and organisation approval');
      cy.task('validateAuthUser', user.email).then(() => cy.log('User validated'));
      get('email-ok').should('exist');
      cy.task('acceptUserInOrg', user.email).then(() => cy.log('User accepted in org'));
      get('org-approval-ok').should('exist');
      get('refresh').click();
      assertUrlIncludes('c/o/dashboard/home');
      //Checks if an admin of this org received the inApp invitation
      cy.task('getRandomOrgAdmin', org.id).then((admin: User) => {
        get('auth-user').click();
        get('auth-logout').click();
        get('login').click();
        assertUrlIncludes('auth/connexion');
        get('email').type(admin.email);
        get('password').type(USER_FIXTURES_PASSWORD);
        get('submit').click();
        assertUrlIncludes('dashboard/home');
        get('invitations-link').click();
        get('invitation').first().should('contain', `${user.firstname} ${user.lastname} wants to join your organization.`);
        get('invitation-status').first().should('contain', 'Accepted');
      });
    });
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
        get('existing-email').should('contain', 'This email already exists');
      });
    });
  });

  it.only('User cannot signup if any input is not valid, or checkbox unchecked', () => {
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
