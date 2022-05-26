﻿process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
import { TestBed } from '@angular/core/testing';
import { MediaService } from './media.service';
import { clearFirestoreData } from 'firebase-functions-test/lib/providers/firestore';
import { ImageParameters, formatParameters } from '../image/directives/imgix-helpers';
import { firebase } from '@env';
import { createStorageFile, UploadData } from '@blockframes/model';
import { FIREBASE_CONFIG, FIRESTORE_SETTINGS } from 'ngfire';

describe('Media Service Test Suite', () => {
  let service: MediaService;

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
        MediaService,
        { provide: FIREBASE_CONFIG, useValue: { options: { projectId: 'test' } } },
        { provide: FIRESTORE_SETTINGS, useValue: { ignoreUndefinedProperties: true, experimentalAutoDetectLongPolling: true } }
      ],
    });
    service = TestBed.inject(MediaService);
  });

  afterEach(() => clearFirestoreData({projectId: 'test'}))

  it('Should check media service is created', () => {
    expect(service).toBeTruthy();
  })

  it('Verify generated ImgIx URL', async () => {
    const imgParam: ImageParameters = {
      auto: 'format', fit: 'facearea', w: 123, h: 321, page: 99,
      s: 'FOO123bar'
    }
    const query = formatParameters(imgParam);
    const expURL = `https://${firebase().projectId}-protected.imgix.net/test?${query}`;
    const storageFile = createStorageFile({
      storagePath: 'test',
      collection: TESTDATA.metadata.collection,
      docId: TESTDATA.metadata.docId,
      field: TESTDATA.metadata.field,
      privacy: TESTDATA.metadata.privacy
    })
    const genURL = await service.generateImgIxUrl(storageFile, imgParam);
    expect(genURL).toBe(expURL);
  });

  it('Verify generated background ImgIx URL', async () => {
    const storageFile = createStorageFile({
      storagePath: 'test',
      collection: TESTDATA.metadata.collection,
      docId: TESTDATA.metadata.docId,
      field: TESTDATA.metadata.field,
      privacy: TESTDATA.metadata.privacy
    })
    const expURL = `https://${firebase().projectId}.imgix.net/test?w=1024`;
    const genURL = await service.generateBackgroundImageUrl(storageFile, {});
    expect(genURL).toBe(expURL);
  });
});
