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
    browserAuth.signinWithEmailAndPassword(user.email);
    get('skip-preferences').click();
    get('auth-user').click();
    get('profile').click();
    assertUrlIncludes('c/o/account/profile/view/settings');
  });
});
