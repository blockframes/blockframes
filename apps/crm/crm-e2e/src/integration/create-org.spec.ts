import {
  // plugins
  adminAuth,
  firestore,
  maintenance,
  // cypress commands
  get,
  connectOtherUser,
  assertUrl,
} from '@blockframes/testing/cypress/browser';
import { admin, newcomers } from '../fixtures/create-org';

const injectedData = {
  [`users/${admin.user.uid}`]: admin.user,
  [`blockframesAdmin/${admin.user.uid}`]: {},
  [`orgs/${admin.org.id}`]: admin.org,
  [`permissions/${admin.permissions.id}`]: admin.permissions,
};

describe('Create organization', () => {
  before(() => {
    cy.visit('');
    maintenance.start();
    firestore.clearTestData();
    adminAuth.deleteAllTestUsers();
    firestore.create([injectedData]);
    adminAuth.createUser({ uid: admin.user.uid, email: admin.user.email, emailVerified: true });
    maintenance.end();
    cy.visit('');
    connectOtherUser(admin.user.email);
  });

  it('create all possible organizations', () => {
    createAllOrgs();
  });
});

function createAllOrgs() {
  for (const [status, appOrganizations] of Object.entries(newcomers)) {
    for (const [app, accesses] of Object.entries(appOrganizations)) {
      for (const [access, data] of Object.entries(accesses)) {
        get('orgs').click();
        assertUrl('c/o/dashboard/crm/organizations');
        get('create-org').click();
        get('creation-form').should('exist');
        get('super-admin-email').type(data.user.email);
        get('from-app').click();
        get(`option_${app}`).click();
        get('name').type(data.org.name);
        get('email').type(`contact-${data.org.email}`);
        get('activity').click();
        get('option_director').click();
        get('description').type(`E2E ${status} ${app} ${access} org`);
        get('street').type('e2e street');
        get('city').type('e2e city');
        get('zip').type('777');
        get('country').click();
        get('option_france').click();
        get('phone').type('0123456789');
        get('status').click();
        get(`option_${status}`).click();
        get(`${app}-marketplace`).click();
        if (access === 'dashboard') get(`${app}-dashboard`).click();
        get('create').click();

        //TODO : check organization page data
      }
    }
  }
}
