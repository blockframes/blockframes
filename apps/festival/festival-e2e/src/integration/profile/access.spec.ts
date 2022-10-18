import { User } from '@blockframes/model';
import {
  // plugins
  adminAuth,
  browserAuth,
  firestore,
  storage,
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

    get('image-uploader').selectFile(imageFixture, { action: 'drag-drop' });
    get('image-uploader').invoke('height').should('equal', 697);
    get('crop-image').click();
    get('update-profile').click({ force: true }); // TODO { force: true } because of snackbar with permission error

    awaitElementDeletion('[test-id="upload-completed"]');
    cy.wait(1000); // Wait until the onFileUpload backend function is triggered
    firestore
      .get(`users/${user.uid}`)
      .then((user: User) => {
        expect(user.avatar.collection).to.equal('users');
        expect(user.avatar.field).to.equal('avatar');
        expect(user.avatar.docId).to.equal(user.uid);
        expect(user.avatar.privacy).to.equal('public');
        expect(user.avatar.storagePath).to.contain(`users/${user.uid}/avatar/default-image`);

        storage.exists(`${user.avatar.privacy}/${user.avatar.storagePath}`).then(exists => {
          expect(exists).to.be.true;
        });
      });

  });
});
