import {
  // plugins
  adminAuth,
  browserAuth,
  firestore,
  maintenance,
  // cypress commands
  get,
  getInList,
  check,
  uncheck,
  assertUrl,
  assertUrlIncludes,
  // cypress tasks
  interceptEmail,
  deleteEmail,
} from '@blockframes/testing/cypress/browser';
import { User, Organization, OrgActivity, Territory, PublicUser } from '@blockframes/model';
import { USER_FIXTURES_PASSWORD } from '@blockframes/devops';

import { newUser, newOrg, marketplaceData, dashboardData } from '../../fixtures/authentification/signup';
import { UserRecord } from '@blockframes/firebase-utils/types';

function deleteUserIfExists(userEmail: string) {
  firestore.queryData({ collection: 'users', field: 'email', operator: '==', value: userEmail }).then((users: User[]) => {
    if (!users.length) return cy.log(`No previous user with ${userEmail}`);
    firestore.delete([`users/${users[0].uid}`]);
  });
}

function deleteOrgIfExists(orgName: string) {
  firestore
    .queryData({ collection: 'orgs', field: 'denomination.full', operator: '==', value: orgName })
    .then((orgs: Organization[]) => {
      if (!orgs.length) return cy.log(`No previous organization named ${orgName}`);
      firestore.delete([`orgs/${orgs[0].id}`]);
    });
}

//? to be used when signing up with known organisation
const marketplaceInjectedData = {
  [`users/${marketplaceData.orgAdmin.uid}`]: marketplaceData.orgAdmin,
  [`orgs/${marketplaceData.org.id}`]: marketplaceData.org,
  [`permissions/${marketplaceData.permissions.id}`]: marketplaceData.permissions,
};
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
    cy.visit('auth/identity');
  });

  it('User from new company can signup', () => {
    deleteOrgIfExists(newOrg.name);
    deleteUserIfExists(newUser.email);
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
