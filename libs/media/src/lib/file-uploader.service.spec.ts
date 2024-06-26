import { TestBed } from '@angular/core/testing';
import { Overlay } from '@angular/cdk/overlay';
import { FileUploaderService } from './file-uploader.service';
import { UploadData } from '@blockframes/model';
import { AuthService } from '@blockframes/auth/service';
import { FireStorage } from 'ngfire';

class DummyService { }

describe('Media Service Test Suite', () => {
  let storage: FireStorage;
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

      providers: [
        FileUploaderService,
        {
          provide: FireStorage, useFactory: () => ({
            upload: jest.fn()
          })
        },
        {
          provide: Overlay, useFactory: () => ({
            create: () => ({ attach: () => ({}), detach: () => ({}) }),
            position: () => ({ global: () => ({ bottom: () => ({ left: () => true }) }) })
          })
        },
        { provide: AuthService, useClass: DummyService },
      ],
    });
    storage = TestBed.inject(FireStorage);
    service = TestBed.inject(FileUploaderService);
  });

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
    expect(storage.upload).not.toHaveBeenCalled()
  })

  it('Upload a file with valid metadata & verify storage upload is invoked', async () => {
    TESTDATA.file = new File([JSON.stringify({ blockframes: 'movies' })], 'test');
    TESTDATA.metadata.docId = 'test';
    TESTDATA.metadata.field = 'test';
    const storagePath = 'unit-test/testFile.tst';
    service.addToQueue(storagePath, TESTDATA);
    service.upload();
    expect(storage.upload).toHaveBeenCalled();
  });
});
