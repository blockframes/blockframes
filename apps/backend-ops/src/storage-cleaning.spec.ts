import { initFunctionsTestMock, populate, getTestingProjectId } from '@blockframes/testing/firebase/functions';
import { StorageMocked } from '@blockframes/testing/firebase';
import { loadAdminServices } from './admin';
import { cleanStorage, cleanMovieDir } from './storage-cleaning';
import { clearFirestoreData } from '@firebase/testing';

let db: FirebaseFirestore.Firestore;
let bucket;
describe('Storage cleaning script', () => {
  beforeAll(async () => {
    initFunctionsTestMock();
    const adminServices = loadAdminServices();
    const storageMocked = new StorageMocked() as any;
    bucket = storageMocked.bucket('test-storage-bucket');
    db = adminServices.db;
    await clearFirestoreData({ projectId: getTestingProjectId() });
  });

  afterEach(async () => {
    // After each test, db is reseted
    await clearFirestoreData({ projectId: getTestingProjectId() });
  });

  it('should return true when cleanStorage is called', async () => {
    const output = await cleanStorage(bucket);
    expect(output).toBeTruthy();
  });

  it('should clean movie directory', async () => {
    const movies = [{ id: 'mov-A' }];

    const prefix = 'movie/';
    const filesBefore = [
      `${prefix}test.svg`, // File at "movie/" root, should be removed
      `${prefix}mov-A/banner.svg`, // Should be kept 
      `${prefix}mov-B/banner.svg`, // Should be removed, related document does not exists
      `${prefix}mov-A/0.3811e455325c6.378a1f524dbb8.754d1cf5abc3a.b32e89e3dd525.20494fcc5776f.c8ff80b73f1ce.096249c3a3e28.f2659267f17-a.254c59bc91fbc.1f59dd90e2fe3.9626ab5860629.491d8d80ca7e-42.004231bef8f54.e3b51f55de0e3.c82e0a57b4a8-31.023036853e078.953e403f1c5d7.fd7f9cd4ea47-2.5854da602566c.d699b2e7604c3.b684ba709d2de.6792820f10747.e954f470884ec.9a600a294575b.b51ae18c574a7.038c8059ebfdf.56b927c052396.c149fd28f0e7d.fb8068d8e8f0.9f9af74aadf9.svg`, // Should be removed, file too long
    ];

    // Load our test set
    await populate('movies', movies);
    bucket.populate(filesBefore);

    const output = await cleanMovieDir(bucket);
    expect(output.total).toEqual(filesBefore.length);
    expect(output.deleted).toEqual(3);

    const filesAfter = (await bucket.getFiles({ prefix }))[0];
    expect(filesAfter.length).toEqual(1);
  });
});
