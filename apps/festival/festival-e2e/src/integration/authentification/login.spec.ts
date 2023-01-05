import {
  // plugins
  adminAuth,
  browserAuth,
  firestore,
  maintenance,
  // cypress specific functions
  refreshIfMaintenance,
  // cypress commands
  check,
  get,
  assertUrlIncludes,
  ensureInput
} from '@blockframes/testing/cypress/browser';
import { user, org, permissions } from '../../fixtures/authentification/login';
import { USER_FIXTURES_PASSWORD } from '@blockframes/devops';

const injectedData = {
  [`users/${user.uid}`]: user,
  [`orgs/${org.id}`]: org,
  [`permissions/${org.id}`]: permissions,
};

describe('Login test', () => {
  it('login and accept Terms and Privacy Policy', () => {
    cy.visit('');
    maintenance.start();
    adminAuth.deleteAllTestUsers();
    firestore.clearTestData();
    adminAuth.createUser({ uid: user.uid, email: user.email, emailVerified: true });
    firestore.create([injectedData]);
    maintenance.end();
    browserAuth.clearBrowserAuth();
    refreshIfMaintenance('festival');
    get('login').click();
    assertUrlIncludes('/connexion');
    ensureInput('signin-email', user.email)
    get('password').type(USER_FIXTURES_PASSWORD);
    get('submit').click();
    check('terms');
    check('privacy-policy');
    get('access').click();
    assertUrlIncludes('c/o/marketplace/home');
  });
});
