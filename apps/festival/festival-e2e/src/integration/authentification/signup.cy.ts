import {
  // plugins
  adminAuth,
  algolia,
  browserAuth,
  firestore,
  gmail,
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
  // firebase-utils
  deleteOrg,
  deleteUser,
  validateUser,
  validateOrg,
  validateInvitation,
  deleteInvitation,
  // helpers
  getTextBody,
  getSubject,
} from '@blockframes/testing/cypress/browser';
import { newUser, newOrg, marketplaceData, dashboardData } from '../../fixtures/authentification/signup';
import { territories, orgActivity } from '@blockframes/model';
import { capitalize } from '@blockframes/utils/helpers';
import { org } from '../../fixtures/authentification/login';
import { e2eSupportEmail } from '@blockframes/utils/constants';

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
    maintenance.start();
    firestore.clearTestData();
    algolia.deleteOrg({ app: 'festival', objectId: org.id });
    adminAuth.deleteAllTestUsers();
    maintenance.end();
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
    interceptEmail(`to:${newUser.email}`).then(mail => {
      const body = getTextBody(mail);
      expect(body).to.include('Thank you for signing up and welcome');
      gmail.deleteEmail(mail.id);
    });
    interceptEmail(`subject:Archipel Market - ${newOrg.name} was created and needs a review`).then(mail =>
      gmail.deleteEmail(mail.id)
    );
    interceptEmail('subject:New user connexion').then(mail => {
      const body = getTextBody(mail);
      expect(body).to.include(newUser.email);
      gmail.deleteEmail(mail.id);
    });
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
    interceptEmail(`to:${newUser.email}`).then(mail => {
      const body = getTextBody(mail);
      expect(body).to.include('Congratulations, your organization was successfully created!');
      gmail.deleteEmail(mail.id);
    });
    get('refresh').click();
    assertUrlIncludes('c/o/marketplace/home');
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
    interceptEmail(`to:${newUser.email}`).then(mail => {
      const subject = getSubject(mail);
      expect(subject).to.include(`Your request to join ${org.name} on Archipel Market is being processed`);
      gmail.deleteEmail(mail.id);
    });
    interceptEmail('subject:New user connexion').then(mail => {
      const body = getTextBody(mail);
      expect(body).to.include(newUser.email);
      gmail.deleteEmail(mail.id);
    });
    cy.log('all mails received');
    assertUrl('c/organization/join-congratulations');
    validateUser(newUser.email);
    get('email-ok').should('exist');
    interceptEmail(`to:${orgAdmin.email}`).then(mail => {
      const subject = getSubject(mail);
      expect(subject).to.include(
        `${newUser.firstName} ${newUser.lastName} would like to join your organization on Archipel Market`
      );
      gmail.deleteEmail(mail.id);
    });
    validateInvitation(newUser.email);
    get('org-approval-ok').should('exist');
    interceptEmail(`to:${newUser.email}`).then(mail => {
      const body = getTextBody(mail);
      expect(body).to.include(`your request to join ${org.name} on Archipel Market was accepted`);
      gmail.deleteEmail(mail.id);
    });
    get('refresh').click();
    assertUrlIncludes('c/o/marketplace/home');
    browserAuth.clearBrowserAuth();
    cy.visit('');
    verifyInvitation(orgAdmin.email, newUser, 'marketplace', 'festival');
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
    interceptEmail(`to:${newUser.email}`).then(mail => {
      const subject = getSubject(mail);
      expect(subject).to.include(`Your request to join ${org.name} on Archipel Market is being processed`);
      gmail.deleteEmail(mail.id);
    });
    interceptEmail(`to:${e2eSupportEmail}`).then(mail => {
      const body = getTextBody(mail);
      expect(body).to.include(newUser.email);
      gmail.deleteEmail(mail.id);
    });
    cy.log('all mails received');
    assertUrl('c/organization/join-congratulations');
    validateUser(newUser.email);
    get('email-ok').should('exist');
    interceptEmail(`to:${orgAdmin.email}`).then(mail => {
      const subject = getSubject(mail);
      expect(subject).to.include(
        `${newUser.firstName} ${newUser.lastName} would like to join your organization on Archipel Market`
      );
      gmail.deleteEmail(mail.id);
    });
    validateInvitation(newUser.email);
    get('org-approval-ok').should('exist');
    interceptEmail(`to:${newUser.email}`).then(mail => {
      const body = getTextBody(mail);
      expect(body).to.include(`your request to join ${org.name} on Archipel Market was accepted`);
      gmail.deleteEmail(mail.id);
    });
    get('refresh').click();
    assertUrlIncludes('c/o/dashboard/home');
    browserAuth.clearBrowserAuth();
    cy.visit('');
    verifyInvitation(orgAdmin.email, newUser, 'dashboard', 'festival');
  });
});
