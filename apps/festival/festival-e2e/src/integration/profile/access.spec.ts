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
  awaitElementDeletion,
} from '@blockframes/testing/cypress/browser';
import { user, org, permissions } from '../../fixtures/authentification/login';
const imageFixture = 'src/fixtures/default-image.webp';

const injectedData = {
  [`users/${user.uid}`]: user,
  [`orgs/${org.id}`]: org,
  [`permissions/${org.id}`]: permissions,
};

describe('Login tests', () => {
  it('login and set a profile picture', () => {
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
    check('terms');
    check('privacy-policy');
    get('access').click();
    get('skip-preferences').click();
    get('auth-user').click();
    get('profile').click();
    assertUrlIncludes('c/o/account/profile/view/settings');

    cy.get('image-uploader').selectFile(imageFixture, { action: 'drag-drop' });

    cy.wait(500); // Waiting for image to be here after drag 
    get('crop-image').click();
    get('update-profile').click({ force: true }); // TODO { force: true } because of snackbar with permission error

    awaitElementDeletion('[test-id="upload-completed"]');
    cy.wait(5000); // Wait until the backend function is triggered
    firestore
      .get(`users/${user.uid}`)
      .then((user: User) => expect(user.avatar.storagePath).to.contain('default-image'));

  });
});
