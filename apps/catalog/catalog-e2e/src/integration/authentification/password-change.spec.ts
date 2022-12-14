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
  interceptEmail,
  deleteEmail,
  snackbarShould,
} from '@blockframes/testing/cypress/browser';
import { user, org, permissions } from '../../fixtures/authentification/password-change';
import { USER_FIXTURES_PASSWORD } from '@blockframes/devops';

const injectedData = {
  [`users/${user.uid}`]: user,
  [`orgs/${org.id}`]: org,
  [`permissions/${org.id}`]: permissions,
};

const newPassword = 'NewPassword';

describe('Password reset & change test', () => {
  beforeEach(() => {
    cy.visit('');
    maintenance.start();
    adminAuth.deleteAllTestUsers();
    firestore.clearTestData();
    adminAuth.createUser({ uid: user.uid, email: user.email, emailVerified: true });
    firestore.create([injectedData]);
    maintenance.end();
    browserAuth.clearBrowserAuth();
    refreshIfMaintenance('catalog');
    get('login').click();
    assertUrlIncludes('/connexion');
  });

  it('An unknown email gets an error', () => {
    get('reset-password').click();
    assertUrlIncludes('auth/reset-password');
    get('email').type('unknown@nomail.com');
    get('reset').click();
    snackbarShould('contain', 'This account does not exist.');
  });

  it('An known user can receive a reset link by mail', () => {
    get('reset-password').click();
    assertUrlIncludes('auth/reset-password');
    get('email').type(user.email);
    get('reset').click();
    interceptEmail({ sentTo: user.email }).then(mail => {
      // because of E2E environement, we can only check if we received a reset link
      const resetLink = mail.html.links.filter(link => link.text === 'Reset Password');
      expect(resetLink).to.have.length(1);
      deleteEmail(mail.id);
    });
  });

  it('An known user can modify his password with a valid profile form', () => {
    accessProfile();
    get('current-password').type(USER_FIXTURES_PASSWORD);
    get('new-password').type('NewPassword');
    get('password-confirm').type('NewPassword');
    get('update-profile').click();
    snackbarShould('contain', 'Password changed.');
    browserAuth.clearBrowserAuth();
    // connect with new password
    get('login').click();
    get('signin-email').type(user.email);
    get('password').type('NewPassword');
    get('submit').click();
    assertUrlIncludes('c/o/marketplace/home');
  });

  it('An known user cannot modify his password with an invalid profile form', () => {
    accessProfile();
    // wrong current password
    get('current-password').type('WrongPassword');
    get('update-profile').click();
    snackbarShould('contain', 'Your information to modify your password is invalid.');
    snackbarShould('not.exist');
    get('current-password').find('input').clear();
    get('current-password').type(USER_FIXTURES_PASSWORD);
    // new password too small
    get('new-password').type('small');
    get('update-profile').click();
    snackbarShould('contain', 'Your information to modify your password is invalid.');
    snackbarShould('not.exist');
    get('min-error').should('exist');
    get('new-password').find('input').clear();
    get('min-error').should('not.exist');
    // new password required
    get('update-profile').click();
    get('required-error').should('exist');
    // new password too long
    get('new-password').type('ThisIsWayTooLongForAPassword');
    get('update-profile').click();
    get('max-error').should('exist');
    get('new-password').find('input').clear();
    get('max-error').should('not.exist');
    // same as current
    get('new-password').type(USER_FIXTURES_PASSWORD);
    get('update-profile').click();
    get('current-error').should('exist');
    get('new-password').find('input').clear();
    get('current-error').should('not.exist');
    // new valid password
    get('new-password').type(newPassword);
    // unmatching confirmation
    get('password-confirm').type('NoMatch');
    get('update-profile').click();
    get('unmatch-error').should('exist');
    get('password-confirm').find('input').clear();
    // required password confirmation
    get('update-profile').click();
    get('confirm-required-error').should('exist');
    // valid confirm
    get('password-confirm').find('input').clear();
    get('password-confirm').type(newPassword);
    get('unmatch-error').should('not.exist');
    get('confirm-required-error').should('not.exist');
  });
});

function accessProfile() {
  browserAuth.signinWithEmailAndPassword(user.email);
  cy.visit('');
  get('skip-preferences').click();
  get('auth-user').click();
  get('profile').click();
}
