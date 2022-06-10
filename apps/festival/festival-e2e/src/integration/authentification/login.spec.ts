import {
  // plugins
  adminAuth,
  browserAuth,
  firestore,
  maintenance,
  // cypress commands
  get,
  assertUrlIncludes,
} from '@blockframes/testing/cypress/browser';
import { USER_FIXTURES_PASSWORD } from '@blockframes/devops';
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
    adminAuth.createUser({ uid: user.uid, email: user.email });
    adminAuth.updateUser({ uid: user.uid, update: { emailVerified: true } });
    firestore.create([injectedData]);
    maintenance.end();
    cypress.refreshIfMaintenance();
    get('login').click();
    assertUrlIncludes('/connexion');
    get('signin-email').type(user.email);
    get('password').type(USER_FIXTURES_PASSWORD);
    get('submit').click();
    get('skip-preferences').should('exist');
  });
});

const cypress = {
  refreshIfMaintenance() {
    cy.get('festival-root').then($el => {
      const $children = $el.children();
      const childrenTagNames = $children.toArray().map(child => child.tagName);
      if (childrenTagNames.includes('blockframes-maintenance'.toUpperCase())) get('maintenance-refresh').click();
    });
  },
};
