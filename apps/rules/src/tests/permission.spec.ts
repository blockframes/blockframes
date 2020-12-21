import {
  apps,
  assertFails,
  assertSucceeds,
} from '@firebase/rules-unit-testing';
import { testFixture } from './fixtures/data';
import { Firestore, initFirestoreApp } from '@blockframes/testing/firebase/functions';
import { META_COLLECTION_NAME, MAINTENANCE_DOCUMENT_NAME } from '@blockframes/utils/maintenance';

//Meta collection, for maintenance control.
const metaDoc = `${META_COLLECTION_NAME}/${MAINTENANCE_DOCUMENT_NAME}`;
testFixture[metaDoc] = {};
testFixture[metaDoc].endedAt = true;

//TODO: 4198
describe.skip('Permission Rules Tests', () => {
  const projectId = `rules-spec-${Date.now()}`;
  let db: Firestore;

  beforeAll(async () => {
    db = await initFirestoreApp(projectId, 'firestore.rules', testFixture, { uid: 'uid-user2' });
  });

  afterAll(() => Promise.all(apps().map((app) => app.delete())));
});
