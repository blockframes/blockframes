import { initFunctionsTestMock } from '@blockframes/testing/firebase/functions';
import { StorageMocked } from '@blockframes/testing/firebase';
import { loadAdminServices } from './admin';
import { cleanStorage } from './storage-cleaning';

describe('Storage cleaning script', () => {
  beforeAll(async () => {
    initFunctionsTestMock();
    loadAdminServices();
  });

  it('should return true when cleanStorage is called', async () => {
    const storageMocked = new StorageMocked() as any;
    const output = await cleanStorage(storageMocked);
    expect(output).toBeTruthy();
  });
});
