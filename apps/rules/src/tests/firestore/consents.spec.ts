import {
  apps,
  assertFails,
  assertSucceeds,
} from '@firebase/rules-unit-testing';
import { testFixture } from './fixtures/data';
import { Firestore, initFirestoreApp } from '@blockframes/testing/firebase/functions';


describe('Consents Rules Tests', () => {
  const projectId = `consentrules-spec-${Date.now()}`;
  let db: Firestore;


  describe('Any user', () => {
    beforeAll(async () => {
      db = await initFirestoreApp(projectId, 'firestore.rules', testFixture, { uid: 'uid-user2' });
    });

    afterAll(() => Promise.all(apps().map((app) => app.delete())));

    it('should not be able to read consent collection', async () => {
      // @TODO
    });

    it('should not be able to write to consent collection', async () => {
      // @TODO
    });

  });

});
