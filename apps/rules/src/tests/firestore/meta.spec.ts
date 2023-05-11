import { assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import { deleteApp, getApps } from 'firebase/app';
import { Firestore, initFirestoreApp, rulesFixtures as testFixture } from '@blockframes/testing/unit-tests';
import { algoliaAnonymousSearchKeyDoc, algoliaSearchKeyDoc, appVersionDoc, metaDoc } from '@blockframes/utils/maintenance';

describe('_META Rules Tests', () => {
  const projectId = `metarules-spec-${Date.now()}`;
  let db: Firestore;

  describe('With not logged in user', () => {
    beforeAll(async () => {
      db = await initFirestoreApp(projectId, 'firestore.rules', testFixture);
    });

    afterAll(() => Promise.all(getApps().map((app) => deleteApp(app))));

    test('should be able to read _META/_MAINTENANCE document', async () => {
      const metaDocRef = db.doc(metaDoc);
      await assertSucceeds(metaDocRef.get());
    });

    test('should be able to read _META/_APP document', async () => {
      const metaDocRef = db.doc(appVersionDoc);
      await assertSucceeds(metaDocRef.get());
    });

    test('should not be able to read _META/_ALGOLIA_ANONYMOUS_SEARCH_KEY document', async () => {
      const metaDocRef = db.doc(algoliaAnonymousSearchKeyDoc);
      await assertFails(metaDocRef.get());
    });

    test('should not be able to read _META/_ALGOLIA_SEARCH_KEY document', async () => {
      const metaDocRef = db.doc(algoliaSearchKeyDoc);
      await assertFails(metaDocRef.get());
    });
  });

  describe('With Anonymous user', () => {
    beforeAll(async () => {
      db = await initFirestoreApp(projectId, 'firestore.rules', testFixture, 'uid-c8-anon', { firebase: { sign_in_provider: 'anonymous' } });
    });

    afterAll(() => Promise.all(getApps().map((app) => deleteApp(app))));

    test('should be able to read _META/_ALGOLIA_ANONYMOUS_SEARCH_KEY document', async () => {
      const metaDocRef = db.doc(algoliaAnonymousSearchKeyDoc);
      await assertSucceeds(metaDocRef.get());
    });

    test('should not be able to read _META/_ALGOLIA_SEARCH_KEY document', async () => {
      const metaDocRef = db.doc(algoliaSearchKeyDoc);
      await assertFails(metaDocRef.get());
    });
  });

  describe('With User member of invalid org', () => {
    beforeAll(async () => {
      db = await initFirestoreApp(projectId, 'firestore.rules', testFixture, 'uid-c8', { firebase: { sign_in_provider: 'password' } });
    });

    afterAll(() => Promise.all(getApps().map((app) => deleteApp(app))));

    test('should be able to read _META/_ALGOLIA_ANONYMOUS_SEARCH_KEY document', async () => {
      const metaDocRef = db.doc(algoliaAnonymousSearchKeyDoc);
      await assertSucceeds(metaDocRef.get());
    });

    test('should not be able to read _META/_ALGOLIA_SEARCH_KEY document', async () => {
      const metaDocRef = db.doc(algoliaSearchKeyDoc);
      await assertFails(metaDocRef.get());
    });
  });

  describe('With User member of valid org', () => {
    beforeAll(async () => {
      db = await initFirestoreApp(projectId, 'firestore.rules', testFixture, 'uid-user2', { firebase: { sign_in_provider: 'password' } });
    });

    afterAll(() => Promise.all(getApps().map((app) => deleteApp(app))));

    test('should not be able to update _META/_MAINTENANCE document', async () => {
      const metaDocRef = db.doc(metaDoc);
      await assertFails(metaDocRef.update({ note: 'document updated' }));
    });

    test('should not be able to update _META/_APP document', async () => {
      const metaDocRef = db.doc(appVersionDoc);
      await assertFails(metaDocRef.update({ note: 'document updated' }));
    });

    test('should not be able to update _META/_ALGOLIA_ANONYMOUS_SEARCH_KEY document', async () => {
      const metaDocRef = db.doc(algoliaAnonymousSearchKeyDoc);
      await assertFails(metaDocRef.update({ note: 'document updated' }));
    });

    test('should not be able to update _META/_ALGOLIA_SEARCH_KEY document', async () => {
      const metaDocRef = db.doc(algoliaSearchKeyDoc);
      await assertFails(metaDocRef.update({ note: 'document updated' }));
    });

    test('should be able to read _META/_ALGOLIA_ANONYMOUS_SEARCH_KEY document', async () => {
      const metaDocRef = db.doc(algoliaAnonymousSearchKeyDoc);
      await assertSucceeds(metaDocRef.get());
    });

    test('should be able to read _META/_ALGOLIA_SEARCH_KEY document', async () => {
      const metaDocRef = db.doc(algoliaSearchKeyDoc);
      await assertSucceeds(metaDocRef.get());
    });

  });
});
