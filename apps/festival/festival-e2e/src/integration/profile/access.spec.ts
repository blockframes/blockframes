import { User } from '@blockframes/model';
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
  check,
  assertUrlIncludes,
} from '@blockframes/testing/cypress/browser';
import { user, org, permissions } from '../../fixtures/authentification/login';
const imageFixture = 'src/fixtures/default-image.webp';

const injectedData = {
  [`users/${user.uid}`]: user,
  [`orgs/${org.id}`]: org,
  [`permissions/${org.id}`]: permissions,
};

describe('Login tests', () => {
  beforeEach(() => {
    cy.visit('');
    browserAuth.clearBrowserAuth();
    maintenance.start();
    adminAuth.deleteAllTestUsers();
    firestore.clearTestData();
    adminAuth.createUser({ uid: user.uid, email: user.email, emailVerified: true });
    firestore.create([injectedData]);
    maintenance.end();
    refreshIfMaintenance();
    cy.visit('');
    browserAuth.signinWithEmailAndPassword(user.email);
    cy.visit('');
  });

  it('login', () => {
    check('terms');
    check('privacy-policy');
    get('access').click();
    get('skip-preferences').click();
    get('auth-user').click();
    get('profile').click();
    assertUrlIncludes('c/o/account/profile/view/settings');
  });

  it('upload profile picture', () => {
    check('terms');
    check('privacy-policy');
    get('access').click();
    get('skip-preferences').click();
    get('auth-user').click();
    get('profile').click();
    assertUrlIncludes('c/o/account/profile/view/settings');

    cy.get('image-uploader').selectFile(imageFixture, {
      action: 'drag-drop'
    });

    cy.wait(500); // TODO remove - Waiting for image to be here
    get('crop-image').click();
    get('update-profile').click();

    cy.wait(5000); // Wait until the backend function is triggered
    firestore.get(`users/${user.uid}`)
      .then((user: User) => expect(user.avatar.storagePath).to.contain('default-image'));

    // TODO check storage path in bucket ?

    // TODO refresh and check avatar ?
  });
});
