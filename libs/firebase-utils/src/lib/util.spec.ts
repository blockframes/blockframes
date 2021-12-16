import * as util from './util';
import {
  initFunctionsTestMock,
  getTestingProjectId,
  populate,
} from '@blockframes/testing/unit-tests';
import { loadAdminServices } from '@blockframes/firebase-utils';
import { apps, clearFirestoreData } from '@firebase/testing';

let db: FirebaseFirestore.Firestore;
describe('Test util.ts generator function getCollectionInBatches', () => {
  beforeAll(async () => {
    initFunctionsTestMock();
    const adminServices = loadAdminServices();
    db = adminServices.db;
    await clearFirestoreData({ projectId: getTestingProjectId() });
  });

  afterAll(() => Promise.all(apps().map((app) => app.delete())));

  it('should return batches of the correct size', async () => {
    // Populate with 12 users
    await populate('users', [
      { uid: 'A' },
      { uid: 'B' },
      { uid: 'C' },
      { uid: 'D' },
      { uid: 'E' },
      { uid: 'F' },
      { uid: 'G' },
      { uid: 'H' },
      { uid: 'I' },
      { uid: 'J' },
      { uid: 'K' },
      { uid: 'L' },
    ]);

    const usersRef = db.collection('users');

    const batchSize = 4;
    let iterations = 3;
    expect.assertions(iterations);
    const docs = util.getCollectionInBatches(usersRef, 'uid', batchSize);
    for await (const chunk of docs) {
      expect(chunk.length).toBe(batchSize);
      iterations -= 1;
      if (!iterations) break;
    }
  });
});
