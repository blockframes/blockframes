﻿import { TestBed } from '@angular/core/testing';
import { MediaService } from './service';
import { ImageParameters, formatParameters, protectedImgixSuffix } from './image/directives/imgix-helpers';
import { firebase } from '@env';
import { createStorageFile, UploadData } from '@blockframes/model';
import { FIREBASE_CONFIG } from 'ngfire';

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
      ],
    });
    service = TestBed.inject(MediaService);
  });

  it('Should check media service is created', () => {
    expect(service).toBeTruthy();
  })

  it('Verify generated ImgIx URL', async () => {
    const imgParam: ImageParameters = {
      auto: 'format', fit: 'facearea', w: 123, h: 321, page: 99,
      s: 'FOO123bar'
    }
    const query = formatParameters(imgParam);
    const expURL = `https://${firebase().projectId}-${protectedImgixSuffix}.imgix.net/test?${query}`;
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
