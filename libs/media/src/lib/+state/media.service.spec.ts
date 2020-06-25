import { createServiceFactory, SpectatorService, mockProvider } from '@ngneat/spectator/jest';
import { MediaService } from './media.service';
import { AngularFireStorage, AngularFireStorageModule } from '@angular/fire/storage';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { FirebaseApp, AngularFireModule } from '@angular/fire';
import { firebase } from '@env';

const random = () => (Math.random() + 1).toString(36).substring(7);

const TESTDATA = {
  path: 'unit-test/',
  blob: new Blob([JSON.stringify({ blockframes: 'movies' })], { type: 'application/json' }),
  dataName: 'test',
  file: new File([JSON.stringify({ blockframes: 'movies' })], 'test')
};

function prepareStorage(afStorage: AngularFireStorage) {
  return afStorage
    .ref(TESTDATA.path.concat(TESTDATA.dataName))
    .delete()
    .toPromise();
}

describe('Media Service', () => {
  let app: FirebaseApp;
  let afStorage: AngularFireStorage;
  let spectator: SpectatorService<MediaService>;

  const createService = createServiceFactory({
    service: MediaService,
    imports: [AngularFireModule.initializeApp(firebase, random()), AngularFireStorageModule],
    providers: [
      mockProvider(Overlay, {
        position: () => ({ global: () => ({ bottom: () => ({ left: () => true }) }) })
      })
    ]
  });

  beforeEach(async () => {
    spectator = createService();
    /* We don't want to trigger the modal */
    spectator.service.overlayRef = {} as OverlayRef;
    app = spectator.inject(FirebaseApp);
    afStorage = spectator.inject(AngularFireStorage);
    const exists = await spectator.service.exists(TESTDATA.path.concat(TESTDATA.dataName));
    if (exists) {
      await prepareStorage(afStorage);
    }
  });

  afterAll(async () => {
    await prepareStorage(afStorage);
    app.delete();
  });

  test('Service exists', () => {
    expect(spectator.service).toBeDefined();
  });

  test('Upload a blob to storage and validate it exists', async () => {
    await spectator.service.uploadBlob({
      path: TESTDATA.path,
      data: TESTDATA.blob,
      fileName: TESTDATA.dataName
    });
    const test = () => spectator.service.exists(TESTDATA.path.concat(TESTDATA.dataName));
    await expect(test()).resolves.toBeDefined();
  });

  test('Upload a file to storage and validate it exists', async () => {
    await spectator.service.uploadFile(TESTDATA.path, TESTDATA.file);
    const test = () => spectator.service.exists(TESTDATA.path.concat(TESTDATA.file.name));
    await expect(test()).resolves.toBeDefined();
  });
});
