import { initFunctionsTestMock, populate, getTestingProjectId } from '@blockframes/testing/firebase/functions';
import { StorageMocked } from '@blockframes/testing/firebase';
import { cleanStorage, cleanMovieDir, cleanMoviesDir, cleanOrgsDir, cleanUsersDir } from './storage-cleaning';
import { clearFirestoreData } from '@firebase/testing';
import { getCollectionRef } from '@blockframes/firebase-utils';

let bucket;
describe('Storage cleaning script', () => {
  beforeAll(async () => {
    initFunctionsTestMock();
    const storageMocked = new StorageMocked();
    bucket = storageMocked.bucket('test-storage-bucket');
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

    const prefix = 'public/movie';
    const filesBefore = [
      'test.png', // File at "movie/" root, should be removed
      'mov-A/banner.png', // Should be kept
      'mov-B/banner.jpg', // Should be removed, related document does not exists
      'mov-A/0.3811e455325c6.378a1f524dbb8.754d1cf5abc3a.b32e89e3dd525.20494fcc5776f.c8ff80b73f1ce.096249c3a3e28.f2659267f17-a.254c59bc91fbc.1f59dd90e2fe3.9626ab5860629.491d8d80ca7e-42.004231bef8f54.e3b51f55de0e3.c82e0a57b4a8-31.023036853e078.953e403f1c5d7.fd7f9cd4ea47-2.5854da602566c.d699b2e7604c3.b684ba709d2de.6792820f10747.e954f470884ec.9a600a294575b.b51ae18c574a7.038c8059ebfdf.56b927c052396.c149fd28f0e7d.fb8068d8e8f0.9f9af74aadf9.svg', // Should be removed, file too long
    ];

    // Load our test set
    await populate('movies', movies);
    bucket.populate(filesBefore, prefix);

    // Check if data have been correctly added
    const documents = await getCollectionRef('movies');
    expect(documents.docs.length).toEqual(1);

    const output = await cleanMovieDir(bucket);
    expect(output.total).toEqual(filesBefore.length);
    expect(output.deleted).toEqual(3);

    const filesAfter = (await bucket.getFiles({ prefix: `${prefix}/` }))[0];
    expect(filesAfter.length).toEqual(1);
  });

  it('should clean movies directory', async () => {
    const movies = [{ id: 'mov-A' }];

    const prefix = 'public/movies';
    const filesBefore = [
      'test.png', // File at "movies/" root, should be removed
      'mov-A/poster.jpg', // Should be kept
      'mov-B/poster.svg', // Should be removed, related document does not exists
      'mov-A/0.3811e455325c6.378a1f524dbb8.754d1cf5abc3a.b32e89e3dd525.20494fcc5776f.c8ff80b73f1ce.096249c3a3e28.f2659267f17-a.254c59bc91fbc.1f59dd90e2fe3.9626ab5860629.491d8d80ca7e-42.004231bef8f54.e3b51f55de0e3.c82e0a57b4a8-31.023036853e078.953e403f1c5d7.fd7f9cd4ea47-2.5854da602566c.d699b2e7604c3.b684ba709d2de.6792820f10747.e954f470884ec.9a600a294575b.b51ae18c574a7.038c8059ebfdf.56b927c052396.c149fd28f0e7d.fb8068d8e8f0.9f9af74aadf9.svg', // Should be removed, file too long
    ];

    // Load our test set
    await populate('movies', movies);
    bucket.populate(filesBefore, prefix);

    // Check if data have been correctly added
    const documents = await getCollectionRef('movies');
    expect(documents.docs.length).toEqual(1);

    const output = await cleanMoviesDir(bucket);
    expect(output.total).toEqual(filesBefore.length);
    expect(output.deleted).toEqual(3);

    const filesAfter = (await bucket.getFiles({ prefix: `${prefix}/` }))[0];
    expect(filesAfter.length).toEqual(1);
  });

  it('should clean public/orgs directory', async () => {
    const orgs = [{ id: 'org-A' }];

    const prefix = 'public/orgs';
    const filesBefore = [
      'random-filename.jpg', // File at "orgs/" root, should be removed
      'org-A/logo/poster.jpg', // Should be kept
      'org-B/logo/poster.svg', // Should be removed, related document does not exists
    ];

    // Load our test set
    await populate('orgs', orgs);
    bucket.populate(filesBefore, prefix);

    // Check if data have been correctly added
    const documents = await getCollectionRef('orgs');
    expect(documents.docs.length).toEqual(1);

    const output = await cleanOrgsDir(bucket);
    expect(output.total).toEqual(filesBefore.length);
    expect(output.deleted).toEqual(2);

    const filesAfter = (await bucket.getFiles({ prefix: `${prefix}/` }))[0];
    expect(filesAfter.length).toEqual(1);
  });

  it('should clean public/users directory', async () => {
    const users = [{ uid: 'A' }, { uid: 'C' }];

    const prefix = 'public/users';
    const filesBefore = [
      'random-filename.png', // File at "users/" root, should be removed
      'A/avatar/my-best-profile.svg', // Should be kept
      'B/avatar/picture.png', // Should be removed, related document does not exists
      'C/avatar/pic-124acb.svg', // Should be kept
    ];

    // Load our test set
    await populate('users', users);
    bucket.populate(filesBefore, prefix);

    // Check if data have been correctly added
    const documents = await getCollectionRef('users');
    expect(documents.docs.length).toEqual(2);

    const output = await cleanUsersDir(bucket);
    expect(output.total).toEqual(filesBefore.length);
    expect(output.deleted).toEqual(2);

    const filesAfter = (await bucket.getFiles({ prefix: `${prefix}/` }))[0];
    expect(filesAfter.length).toEqual(2);
  });

});
