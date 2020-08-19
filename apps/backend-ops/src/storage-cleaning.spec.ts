import { initFunctionsTestMock } from '@blockframes/testing/firebase/functions';
import { StorageMocked } from '@blockframes/testing/firebase';
import { loadAdminServices } from './admin';
import { cleanStorage, cleanMovieDir } from './storage-cleaning';

let bucket;
describe('Storage cleaning script', () => {
  beforeAll(async () => {
    initFunctionsTestMock();
    loadAdminServices();
    const storageMocked = new StorageMocked() as any;
    bucket = storageMocked.bucket('test-storage-bucket');
  });

  it('should return true when cleanStorage is called', async () => {
    const output = await cleanStorage(bucket);
    expect(output).toBeTruthy();
  });

  it('should clean movie directory', async () => {
    const prefix = 'movie/';
    const filesBefore = [
      `${prefix}test.svg`, // File at "movie/" root, should be removed
      `${prefix}mov-A/banner.svg`,
    ];
    // @todo add movie to db

    bucket.populate(filesBefore);

    const output = await cleanMovieDir(bucket);
    expect(output.total).toEqual(filesBefore.length);
    expect(output.deleted).toEqual(1);
    
    const filesAfter = (await bucket.getFiles({ prefix }))[0];
    expect(filesAfter.length).toEqual(1);
  });
});
