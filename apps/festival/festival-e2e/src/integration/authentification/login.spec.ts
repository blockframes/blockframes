import {
  // plugins
  adminAuth,
  browserAuth,
  firestore,
  maintenance,
  // cypress specific functions
  refreshIfMaintenance,
  // cypress commands
  get,
  assertUrlIncludes,
} from '@blockframes/testing/cypress/browser';
import { user, org, permissions } from '../../fixtures/authentification/login';
import { USER_FIXTURES_PASSWORD } from '@blockframes/devops';

const injectedData = {
  [`users/${user.uid}`]: user,
  [`orgs/${org.id}`]: org,
  [`permissions/${org.id}`]: permissions,
};

describe('Login tests', () => {
  it('login', () => {
    cy.visit('');
    browserAuth.clearBrowserAuth();
    maintenance.start();
    adminAuth.deleteAllTestUsers();
    firestore.clearTestData();
    adminAuth.createUser({ uid: user.uid, email: user.email, emailVerified: true });
    firestore.create([injectedData]);
    maintenance.end();
    refreshIfMaintenance();
    get('login').click();
    assertUrlIncludes('/connexion');
    get('signin-email').type(user.email);
    get('password').type(USER_FIXTURES_PASSWORD);
    get('submit').click();
    get('skip-preferences').should('exist');
  });
});
