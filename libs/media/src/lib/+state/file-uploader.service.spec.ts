process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
import { TestBed } from '@angular/core/testing';
import { Overlay } from '@angular/cdk/overlay';
import { clearFirestoreData } from '@firebase/rules-unit-testing';
import { FileUploaderService } from './file-uploader.service';
import { UploadData } from '@blockframes/model';
import { AuthService } from '@blockframes/auth/+state/auth.service';
import { getApp, initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { initializeFirestore, provideFirestore } from '@angular/fire/firestore';
import * as storage from '@angular/fire/storage';

class DummyService { }

describe('Media Service Test Suite', () => {
  let service: FileUploaderService;

  const TESTDATA: UploadData = {
    file: undefined, // insert blob or file
    fileName: 'test.tst',
    metadata: {
      uid: '',
      collection: 'users',
      docId: '',
      field: '',
      privacy: 'public'
    }
  };

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [
        provideFirebaseApp(() => initializeApp({ projectId: 'test' })),
        provideFirestore(() => initializeFirestore(getApp(), { experimentalAutoDetectLongPolling: true })),
        storage.provideStorage(() => storage.getStorage()),
      ],
      providers: [
        FileUploaderService,
        {
          provide: Overlay, useFactory: () => ({
            create: () => ({ attach: () => ({}), detach: () => ({}) }),
            position: () => ({ global: () => ({ bottom: () => ({ left: () => true }) }) })
          })
        },
        { provide: AuthService, useClass: DummyService },
      ],
    });
    service = TestBed.inject(FileUploaderService);

    // Mock ref function
    jest.spyOn(storage, 'ref').mockImplementation(() => ({} as any));

    // Mock uploadBytesResumable function
    jest.spyOn(storage, 'uploadBytesResumable').mockImplementation(() => ({
      then: () => { true },
      on: () => { true }
    } as any));
  });

  afterEach(() => clearFirestoreData({ projectId: 'test' }))

  it('Should check file uploader service is created', () => {
    expect(service).toBeTruthy();
  })

  // Check if blob is added to queue
  it('Verify a blob has been added to the upload queue', () => {
    TESTDATA.file = new Blob([JSON.stringify({ blockframes: 'movies' })], { type: 'application/json' });
    const storagePath = 'unit-test/testBlob.tst';
    service.addToQueue(storagePath, TESTDATA);
    const task = service.retrieveFromQueue(storagePath);
    expect(task).toBeDefined();
  })

  // Check if file is added to queue
  it('Verify a file has been added to the upload queue', () => {
    TESTDATA.file = new File([JSON.stringify({ blockframes: 'movies' })], 'test');
    const storagePath = 'unit-test/testFile.tst';
    service.addToQueue(storagePath, TESTDATA);
    const task = service.retrieveFromQueue(storagePath);
    expect(task).toBeDefined();
  })

  it('Upload a file with invalid metadata & verify storage upload not is invoked', async () => {
    TESTDATA.file = new File([JSON.stringify({ blockframes: 'movies' })], 'test');
    const storagePath = 'unit-test/testFile.tst';
    service.addToQueue(storagePath, TESTDATA);
    service.upload();
    expect(storage.uploadBytesResumable).not.toHaveBeenCalled();
  })

  it('Upload a file with valid metadata & verify storage upload is invoked', async () => {
    TESTDATA.file = new File([JSON.stringify({ blockframes: 'movies' })], 'test');
    TESTDATA.metadata.docId = 'test';
    TESTDATA.metadata.field = 'test';
    const storagePath = 'unit-test/testFile.tst';
    service.addToQueue(storagePath, TESTDATA);
    service.upload();
    expect(storage.uploadBytesResumable).toHaveBeenCalled();
  });
});
