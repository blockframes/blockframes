import {
  // plugins
  adminAuth,
  algolia,
  browserAuth,
  firestore,
  maintenance,
  // cypress commands
  get,
  getInList,
  check,
  assertUrl,
  assertUrlIncludes,
  // cypress tasks
  interceptEmail,
  deleteEmail,
} from '@blockframes/testing/cypress/browser';
import {
  User,
  Organization,
  OrgActivity,
  Territory,
  PublicUser,
  territories,
  orgActivity,
  PublicInvitation,
} from '@blockframes/model';
import { USER_FIXTURES_PASSWORD } from '@blockframes/devops';
import { newUser, newOrg, marketplaceData, dashboardData } from '../../fixtures/authentification/signup';
import { UserRecord } from '@blockframes/firebase-utils/types';
import { WhereFilterOp } from 'firebase/firestore';
import { capitalize } from '@blockframes/utils/helpers';

const marketplaceInjectedData = {
  [`users/${marketplaceData.orgAdmin.uid}`]: marketplaceData.orgAdmin,
  [`orgs/${marketplaceData.org.id}`]: marketplaceData.org,
  [`permissions/${marketplaceData.permissions.id}`]: marketplaceData.permissions,
};
//? to be used when signing up with a dashboard organisation
const dashboardInjectedData = {
  [`users/${dashboardData.orgAdmin.uid}`]: dashboardData.orgAdmin,
  [`orgs/${dashboardData.org.id}`]: dashboardData.org,
  [`permissions/${dashboardData.permissions.id}`]: dashboardData.permissions,
};
//?-------------------

describe('Signup', () => {
  beforeEach(() => {
    cy.visit('');
    firestore.clearTestData();
    adminAuth.deleteAllTestUsers();
    browserAuth.clearBrowserAuth();
  });

  it('User from new company can signup', () => {
    deleteOrgIfExists(newOrg.name);
    deleteUserIfExists(newUser.email);
    cy.visit('auth/identity');
    get('cookies').click();
    fillCommonInputs(newUser);
    addNewCompany(newOrg);
    get('submit').click();
    interceptEmail({ sentTo: newUser.email }).then(mail => deleteEmail(mail.id));
    interceptEmail({ subject: `Archipel Market - ${newOrg.name} was created and needs a review` }).then(mail =>
      deleteEmail(mail.id)
    );
    interceptEmail({ body: `${newUser.email}` }).then(mail => deleteEmail(mail.id));
    cy.log('all mails received');
    assertUrl('c/organization/create-congratulations');
    get('profile-data-ok').should('exist');
    get('org-data-ok').should('exist');
    get('email-pending').should('exist');
    get('org-approval-pending').should('exist');
    cy.log('waiting for user confirmation and organisation approval');
    adminAuth.getUser(newUser.email).then((user: UserRecord) => {
      adminAuth.updateUser({ uid: user.uid, update: { emailVerified: true } });
      firestore.update([{ docPath: `users/${user.uid}`, field: '_meta.emailVerified', value: true }]);
    });
    firestore
      .queryData({ collection: 'orgs', field: 'denomination.full', operator: '==', value: newOrg.name })
      .then((orgs: Organization[]) => {
        const [newOrg] = orgs;
        firestore.update([{ docPath: `orgs/${newOrg.id}`, field: 'status', value: 'accepted' }]);
      });
    get('org-approval-ok').should('exist');
    get('email-ok').should('exist');
    get('refresh').click();
    assertUrlIncludes('c/o/marketplace/home');
    get('skip-preferences').click();
  });

  it('User from a known organization with access to festival marketplace can signup', () => {
    const { org, orgAdmin } = marketplaceData;
    deleteUserIfExists(newUser.email);
    deleteInvitationIfExists(newUser.email);
    algolia.storeOrganization(org);
    maintenance.start();
    adminAuth.createUser({ uid: orgAdmin.uid, email: orgAdmin.email });
    adminAuth.updateUser({ uid: orgAdmin.uid, update: { emailVerified: true } });
    firestore.create([marketplaceInjectedData]);
    maintenance.end();
    cy.visit('auth/identity');
    get('cookies').click();
    fillCommonInputs(newUser);
    selectCompany(marketplaceData.org.denomination.full);
    get('activity').should('contain', orgActivity[org.activity]);
    get('country').should('contain', capitalize(territories[org.addresses.main.country]));
    get('submit').click();
    interceptEmail({ sentTo: newUser.email }).then(mail => deleteEmail(mail.id));
    interceptEmail({ body: `${newUser.email}` }).then(mail => deleteEmail(mail.id));
    cy.log('all mails received');
    assertUrl('c/organization/join-congratulations');
    adminAuth.getUser(newUser.email).then((user: UserRecord) => {
      adminAuth.updateUser({ uid: user.uid, update: { emailVerified: true } });
      firestore.update([{ docPath: `users/${user.uid}`, field: '_meta.emailVerified', value: true }]);
    });
    get('email-ok').should('exist');
    firestore
      .queryData({ collection: 'invitations', field: 'fromUser.email', operator: '==', value: newUser.email })
      .then((invitations: PublicInvitation[]) =>
        firestore.update([{ docPath: `invitations/${invitations[0].id}`, field: 'status', value: 'accepted' }])
      );
    get('org-approval-ok').should('exist');
    get('refresh').click();
    assertUrlIncludes('c/o/marketplace/home');
    get('skip-preferences').click();
    browserAuth.clearBrowserAuth();
    cy.visit('');
    get('login').click();
    assertUrlIncludes('auth/connexion');
    get('signin-email').should('be.visible').type(orgAdmin.email);
    get('password').type(USER_FIXTURES_PASSWORD);
    get('submit').click();
    assertUrlIncludes('marketplace/home');
    get('skip-preferences').click();
    get('invitations-link').click();
    get('invitation').first().should('contain', `${newUser.firstName} ${newUser.lastName} wants to join your organization.`);
    get('invitation-status').first().should('contain', 'Accepted');
  });
});

//* JS Functions *//

function fillCommonInputs(user: PublicUser) {
  get('email').type(user.email);
  get('first-name').type(user.firstName);
  get('last-name').type(user.lastName);
  get('password').type(USER_FIXTURES_PASSWORD);
  get('password-confirm').type(USER_FIXTURES_PASSWORD);
  check('terms');
  check('gdpr');
}

function addNewCompany(data: { name: string; activity: OrgActivity; country: Territory }) {
  const { name, activity, country } = data;
  get('org').type(name);
  get('new-org').click();
  get('activity').click();
  getInList('activity_', activity);
  get('activity').should('contain', activity);
  get('country').click();
  getInList('country_', country);
  get('country').should('contain', country);
  get('role').contains('Buyer').click();
}

function selectCompany(orgName: string) {
  get('org').type(orgName);
  getInList('org_', orgName);
}

function deleteUserIfExists(userEmail: string) {
  const query = { collection: 'users', field: 'email', operator: '==' as WhereFilterOp, value: userEmail };
  firestore.queryData(query).then((users: User[]) => {
    if (!users.length) return cy.log(`No previous user with ${userEmail}`);
    firestore.delete([`users/${users[0].uid}`]);
  });
}

function deleteOrgIfExists(orgName: string) {
  const query = { collection: 'orgs', field: 'denomination.full', operator: '==' as WhereFilterOp, value: orgName };
  firestore.queryData(query).then((orgs: Organization[]) => {
    if (!orgs.length) return cy.log(`No previous organization named ${orgName}`);
    firestore.delete([`orgs/${orgs[0].id}`]);
  });
}

function deleteInvitationIfExists(userEmail: string) {
  const query = { collection: 'invitations', field: 'fromUser.email', operator: '==' as WhereFilterOp, value: newUser.email };
  firestore.queryData(query).then((invitations: PublicInvitation[]) => {
    if (!invitations.length) return cy.log(`No previous invitations from ${userEmail}`);
    firestore.delete([`invitations/${invitations[0].id}`]);
  });
}
