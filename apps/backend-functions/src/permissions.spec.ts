import {
  apps,
  assertFails,
  assertSucceeds,
} from '@firebase/rules-unit-testing';
import { clearFirestoreData } from "@firebase/testing";
import { testFixture } from './fixtures/data';
import { Firestore, initFirestoreApp } from '@blockframes/testing/firebase/functions';

//import { getTestingProjectId, initFunctionsTestMock } from "@blockframes/testing/firebase/functions";

describe('Permissions Functions Test', () => {
  const projectId = `perm-spec-${Date.now()}`;
  let db: Firestore;

  beforeAll(async () => {
    //initFunctionsTestMock();
    db = await initFirestoreApp(projectId, 'firestore.rules', testFixture, { uid: 'uid-bfAdmin', firebase: { sign_in_provider: 'password' } });
  });

  afterEach(async () => {
    // After each test, db is reseted
    //await clearFirestoreData({ projectId });
  });

  it('Should be able to delete permissions', async () => {
    expect(true).toBeTruthy();
    const orgRef = 'O003';
    //Create a permission document and sub-document
    const permissionRef = db.doc(`permissions/${orgRef}`);
    await assertSucceeds(permissionRef.delete());
  })

});