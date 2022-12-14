import {
  // plugins
  adminAuth,
  algolia,
  browserAuth,
  firestore,
  maintenance,
  // cypress commands
  get,
  assertUrl,
  assertUrlIncludes,
  // cypress specific functions
  addNewCompany,
  fillCommonInputs,
  selectCompany,
  verifyInvitation,
  // cypress tasks
  interceptEmail,
  deleteEmail,
  // firebase-utils
  deleteOrg,
  deleteUser,
  validateUser,
  validateOrg,
  validateInvitation,
  deleteInvitation,
} from '@blockframes/testing/cypress/browser';
import { newUser, newOrg, marketplaceData, dashboardData } from '../../fixtures/authentification/signup';
import { territories, orgActivity } from '@blockframes/model';
import { capitalize } from '@blockframes/utils/helpers';
import { org } from '../../fixtures/authentification/login';

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

describe('Signup', () => {
  beforeEach(() => {
    cy.visit('');
    firestore.clearTestData();
    algolia.deleteOrg({ app: 'festival', objectId: org.id });
    adminAuth.deleteAllTestUsers();
    browserAuth.clearBrowserAuth();
  });

  it('User from new company can signup', () => {
    deleteOrg(newOrg.name);
    deleteUser(newUser.email);
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
    validateUser(newUser.email);
    validateOrg(newOrg.name);
    get('org-approval-ok').should('exist');
    get('email-ok').should('exist');
    get('refresh').click();
    assertUrlIncludes('c/o/marketplace/home');
    get('skip-preferences').click();
  });

  it('User from a known organization with access to festival marketplace can signup', () => {
    const { org, orgAdmin } = marketplaceData;
    deleteUser(newUser.email);
    deleteInvitation(newUser.email);
    algolia.storeOrganization(org);
    maintenance.start();
    adminAuth.createUser({ uid: orgAdmin.uid, email: orgAdmin.email, emailVerified: true });
    firestore.create([marketplaceInjectedData]);
    maintenance.end();
    cy.visit('auth/identity');
    get('cookies').click();
    fillCommonInputs(newUser);
    selectCompany(marketplaceData.org.name);
    get('activity').should('contain', orgActivity[org.activity]);
    get('country').should('contain', capitalize(territories[org.addresses.main.country]));
    get('submit').click();
    interceptEmail({ sentTo: newUser.email }).then(mail => deleteEmail(mail.id));
    interceptEmail({ body: `${newUser.email}` }).then(mail => deleteEmail(mail.id));
    cy.log('all mails received');
    assertUrl('c/organization/join-congratulations');
    validateUser(newUser.email);
    get('email-ok').should('exist');
    validateInvitation(newUser.email);
    get('org-approval-ok').should('exist');
    get('refresh').click();
    assertUrlIncludes('c/o/marketplace/home');
    get('skip-preferences').click();
    browserAuth.clearBrowserAuth();
    cy.visit('');
    verifyInvitation(orgAdmin.email, newUser, 'marketplace');
  });

  it('User from a known organization with access to festival dashboard can signup', () => {
    const { org, orgAdmin } = dashboardData;
    deleteUser(newUser.email);
    deleteInvitation(newUser.email);
    algolia.storeOrganization(org);
    maintenance.start();
    adminAuth.createUser({ uid: orgAdmin.uid, email: orgAdmin.email, emailVerified: true });
    firestore.create([dashboardInjectedData]);
    maintenance.end();
    cy.visit('auth/identity');
    get('cookies').click();
    fillCommonInputs(newUser);
    selectCompany(dashboardData.org.name);
    get('activity').should('contain', orgActivity[org.activity]);
    get('country').should('contain', capitalize(territories[org.addresses.main.country]));
    get('submit').click();
    interceptEmail({ sentTo: newUser.email }).then(mail => deleteEmail(mail.id));
    interceptEmail({ body: `${newUser.email}` }).then(mail => deleteEmail(mail.id));
    cy.log('all mails received');
    assertUrl('c/organization/join-congratulations');
    validateUser(newUser.email);
    get('email-ok').should('exist');
    validateInvitation(newUser.email);
    get('org-approval-ok').should('exist');
    get('refresh').click();
    assertUrlIncludes('c/o/dashboard/home');
    browserAuth.clearBrowserAuth();
    cy.visit('');
    verifyInvitation(orgAdmin.email, newUser, 'dashboard');
  });
});
