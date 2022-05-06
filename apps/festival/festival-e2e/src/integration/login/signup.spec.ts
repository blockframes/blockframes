import {
  auth,
  get,
  getInList,
  check,
  assertUrl,
  interceptEmail,
  deleteEmail,
  assertUrlIncludes,
  createFakeUserDataArray
} from '@blockframes/testing/cypress/browser';
import { capitalize } from '@blockframes/utils/helpers';
import { User, Organization, orgActivity, territories } from '@blockframes/model';
import { USER_FIXTURES_PASSWORD } from '@blockframes/firebase-utils/anonymize/util';

const [newOrgUser, knownMarketplaceOrgUser, knownDashboardOrgUser] = createFakeUserDataArray(3);

function deleteUserIfExists(userEmail: string) {
  cy.task('getAuthUserByEmail', userEmail)
    .then((user: User) => {
      if (!user) return console.log('No previous user with this email');
      cy.task('deleteAuthUser', user.uid);
      cy.task('deleteUser', user.uid);
  });
}

function deleteOrgIfExists(orgName: string) {
  cy.task('getOrgByName', orgName)
    .then((org: Organization) => {
      if (!org) return console.log('No previous organization with this name');
      cy.task('deleteOrg', org.id);
  });
}

describe('Signup', () => {

  beforeEach(() => {
    cy.visit('');
    auth.clearBrowserAuth();
    cy.visit('auth/identity');
  });

  it('User from new company can signup', () => {
    const user = newOrgUser;
    deleteUserIfExists(user.email);
    deleteOrgIfExists(user.company.name);
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
    // click({ force: true }) to avoid the element being hidden by a snackbar locally
    get('submit').click({ force: true });
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
    deleteUserIfExists(user.email);
    deleteOrgIfExists(user.company.name);
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
      get('submit').click({ force: true });
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
    deleteUserIfExists(user.email);
    deleteOrgIfExists(user.company.name);
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
      get('submit').click({ force: true });
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

});
