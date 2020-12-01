import {
  apps,
  assertFails,
  assertSucceeds,
  initializeTestApp,
  loadFirestoreRules,
  initializeAdminApp,
} from '@firebase/rules-unit-testing';
import { testFixture } from './fixtures/data';
import fs from 'fs';
import { TokenOptions } from '@firebase/rules-unit-testing/dist/src/api';
import { META_COLLECTION_NAME, MAINTENANCE_DOCUMENT_NAME } from '@blockframes/utils/maintenance';

//Meta collection, for maintenance control.
const metaDoc = `${META_COLLECTION_NAME}/${MAINTENANCE_DOCUMENT_NAME}`;

type ExtractPromise<T> = T extends Promise<infer I> ? I : never;
type PromiseFirestore = ReturnType<typeof initFirestoreApp>;
type Firestore = ExtractPromise<PromiseFirestore>;

testFixture[metaDoc] = {};
testFixture[metaDoc].endedAt = true;

//TODO: #4373 : Refactor init code to a lib
async function initFirestoreApp(
  projectId: string,
  rulePath: string,
  data: Record<string, Object> = {},
  auth?: TokenOptions
) {
  //Define these env vars to avoid getting console warnings
  process.env.GCLOUD_PROJECT = projectId;
  process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
  await setData(projectId, data);
  const app = initializeTestApp({ projectId, auth });
  await loadFirestoreRules({ projectId, rules: fs.readFileSync(rulePath, 'utf8') });

  return app.firestore();
}

function setData(projectId: string, dataDB: Record<string, Object>) {
  const app = initializeAdminApp({ projectId });
  const db = app.firestore();
  // Write data to firestore app
  const promises = Object.entries(dataDB).map(([key, doc]) => db.doc(key).set(doc));
  return Promise.all(promises);
}

describe('Campaign Security Rules', () => {
  const projectId = `rules-spec-${Date.now()}`;
  let db: Firestore;

  describe('User in org', () => {
    const existingCampaign = 'M001';
    const updateCampaign = 'MI-007';
    const existingCampaignNotFromOrg = 'MI-077';

    beforeAll(async () => {
      db = await initFirestoreApp(projectId, 'firestore.rules', testFixture, {
        uid: 'uid-user2',
      });
    });

    afterAll(() => Promise.all(apps().map((app) => app.delete())));

    test('should be able to read campaign', async () => {
      const campaignRef = db.doc(`campaigns/${existingCampaignNotFromOrg}`);
      await assertSucceeds(campaignRef.get());
    });

    test('should be able to create campaign', async () => {
      const newCampaign = 'MI-007';
      const campaignData = { orgId: 'O001' };
      const campaignRef = db.doc(`campaigns/${newCampaign}`);
      await assertSucceeds(campaignRef.set(campaignData));
    });

    test('should be able to update campaign', async () => {
      const campaignRef = db.doc(`campaigns/${updateCampaign}`);
      await assertSucceeds(campaignRef.update({ note: 'Just do it!' }));
    });

    test("shouldn't be able to delete campaign", async () => {
      const campaignRef = db.doc(`campaigns/${existingCampaign}`);
      await assertFails(campaignRef.delete());
    });
  });

  describe('User not in org', () => {
    const newCampaign = 'MI-007';
    const existingCampaign = 'M001';

    beforeAll(async () => {
      db = await initFirestoreApp(projectId, 'firestore.rules', testFixture, {
        uid: 'uid-peeptom',
      });
    });

    afterAll(() => Promise.all(apps().map((app) => app.delete())));

    test('should be able to read campaign', async () => {
      const campaignRef = db.doc(`campaigns/${existingCampaign}`);
      await assertSucceeds(campaignRef.get());
    });

    test("shouldn't be able to create campaign", async () => {
      const campaignRef = db.doc(`campaigns/${newCampaign}`);
      await assertFails(campaignRef.set({ id: newCampaign }));
    });

    test("shouldn't be able to update campaign", async () => {
      const campaignRef = db.doc(`campaigns/${existingCampaign}`);
      await assertFails(campaignRef.update({ note: 'Just do it!' }));
    });
  });
});
