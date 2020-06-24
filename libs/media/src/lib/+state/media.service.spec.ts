import { createServiceFactory, SpectatorService, mockProvider } from '@ngneat/spectator/jest';
import { MediaService } from './media.service';
import { AngularFireStorage, AngularFireStorageModule } from '@angular/fire/storage';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { FirebaseApp, AngularFireModule } from '@angular/fire';
import { firebase } from '@env';
import { MediaQuery } from './media.query';
import { MediaStore } from './media.store';

const random = () => (Math.random() + 1).toString(36).substring(7);

const TESTDATA = {
  path: 'unit-test/',
  blob: new Blob([JSON.stringify({ blockframes: 'movies' })], { type: 'application/json' }),
  dataName: 'test',
  file: new File([JSON.stringify({ blockframes: 'movies' })], 'test'),
}

async function prepareStorage(afStorage: AngularFireStorage) {
  return afStorage.ref(TESTDATA.path.concat(TESTDATA.dataName)).delete().toPromise()
}

describe('Media Service', () => {
  let app: FirebaseApp;
  let afStorage: AngularFireStorage;
  let spectator: SpectatorService<MediaService>;
  let query: MediaQuery

  const createService = createServiceFactory({
    service: MediaService,
    imports: [AngularFireModule.initializeApp(firebase, random()), AngularFireStorageModule],
    providers: [MediaQuery, MediaStore, mockProvider(Overlay, {
      position: () => {
        return {
          global: () => {
            return {
              bottom: () => {
                return {
                  left: () => true
                }
              }
            }
          }
        }
      }
    })],
  });


  beforeEach(() => {
    spectator = createService();
    /* We don't want to trigger the modal */
    spectator.service.overlayRef = {} as OverlayRef
    app = spectator.inject(FirebaseApp);
    afStorage = spectator.inject(AngularFireStorage);
    query = spectator.inject(MediaQuery);
  });

  afterAll(async () => {
    await prepareStorage(afStorage)
    app.delete();
  });

  test('Service exists', () => {
    expect(spectator.service).toBeDefined();
  })

  test('Upload a blob to storage and validate it exists', async done => {
    prepareStorage(afStorage)
    spectator.service.uploadBlob({ path: TESTDATA.path, data: TESTDATA.blob, fileName: TESTDATA.dataName });
    let result: boolean;
    setTimeout(async () => {
      result = await spectator.service.exists(TESTDATA.path.concat(TESTDATA.dataName));
      expect(result).toBe(true)
      done();
    }, 500)
  })

  test('Upload a file to storage and validate it exists', async done => {
     prepareStorage(afStorage)
    spectator.service.uploadFile(TESTDATA.path, TESTDATA.file);
    let result: boolean;
    setTimeout(async () => {
      result = await spectator.service.exists(TESTDATA.path.concat(TESTDATA.file.name));
      expect(result).toBe(true)
      done();
    }, 500)
  })
});