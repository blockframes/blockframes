import { adminAuth, maintenance, fakeUserData } from '@blockframes/testing/cypress/browser';
import { UserRecord } from '@blockframes/firebase-utils';

const orgAdmin = fakeUserData();
const adminUid = '0-e2e-orgAdminUid';

describe('Auth tests', () => {
  it('create / get / update / delete', () => {
    cy.visit('');
    maintenance.start();
    adminAuth.deleteAllTestUsers();
    adminAuth.getUser(adminUid).then((user: UserRecord) => expect(user).to.be.null);
    adminAuth.createUser({ uid: adminUid, email: orgAdmin.email });
    adminAuth.getUser(adminUid).then((user: UserRecord) => expect(user.emailVerified).to.be.false);
    adminAuth.updateUser({ uid: adminUid, update: { emailVerified: true } });
    adminAuth.getUser(adminUid).then((user: UserRecord) => expect(user.emailVerified).to.be.true);
    adminAuth.deleteUser(adminUid);
    adminAuth.getUser(adminUid).then((user: UserRecord) => expect(user).to.be.null);
    maintenance.end();
  });
});
