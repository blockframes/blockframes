import { TestBed } from '@angular/core/testing';
import { MediaService } from './media.service';
import { AngularFireModule } from '@angular/fire';
import { SETTINGS, AngularFirestoreModule } from '@angular/fire/firestore';
import { clearFirestoreData } from '@firebase/rules-unit-testing';
import { ImageParameters, formatParameters } from '../image/directives/imgix-helpers';
import { firebase } from '@env';
import { createStorageFile, UploadData } from '@blockframes/shared/model';

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
      privacy: 'public',
    },
  };

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [AngularFireModule.initializeApp({ projectId: 'test' }), AngularFirestoreModule],
      providers: [MediaService, { provide: SETTINGS, useValue: { host: 'localhost:8080', ssl: false } }],
    });
    service = TestBed.inject(MediaService);
  });

  afterEach(() => clearFirestoreData({ projectId: 'test' }));

  it('Should check media service is created', () => {
    expect(service).toBeTruthy();
  });

  it('Verify generated ImgIx URL', async () => {
    const imgParam: ImageParameters = {
      auto: 'format',
      fit: 'facearea',
      w: 123,
      h: 321,
      page: 99,
      s: 'FOO123bar',
    };
    const query = formatParameters(imgParam);
    const expURL = `https://${firebase().projectId}-protected.imgix.net/test?${query}`;
    const storageFile = createStorageFile({
      storagePath: 'test',
      collection: TESTDATA.metadata.collection,
      docId: TESTDATA.metadata.docId,
      field: TESTDATA.metadata.field,
      privacy: TESTDATA.metadata.privacy,
    });
    const genURL = await service.generateImgIxUrl(storageFile, imgParam);
    expect(genURL).toBe(expURL);
  });

  it('Verify generated background ImgIx URL', async () => {
    const storageFile = createStorageFile({
      storagePath: 'test',
      collection: TESTDATA.metadata.collection,
      docId: TESTDATA.metadata.docId,
      field: TESTDATA.metadata.field,
      privacy: TESTDATA.metadata.privacy,
    });
    const expURL = `https://${firebase().projectId}.imgix.net/test?w=1024`;
    const genURL = await service.generateBackgroundImageUrl(storageFile, {});
    expect(genURL).toBe(expURL);
  });
});
