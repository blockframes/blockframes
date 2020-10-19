import { TestBed } from '@angular/core/testing';
import { Overlay } from '@angular/cdk/overlay';
import { MediaService } from './media.service';
import { UploadData } from "./media.firestore";
import { AngularFireModule } from '@angular/fire';
import { AngularFireStorage } from "@angular/fire/storage";
import { SETTINGS, AngularFirestoreModule, AngularFirestore } from '@angular/fire/firestore';
import { clearFirestoreData } from '@firebase/testing';
import { ImageParameters, formatParameters } from "../directives/image-reference/imgix-helpers";
import { firebase } from '@env';

describe('Notifications Test Suite', () => {
  let service: MediaService;
  let db: AngularFirestore;
  let storage: AngularFireStorage;
  const TESTDATA: UploadData = {
    path: 'unit-test/',
    data: null,
    fileName: 'test.tst'
  };

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [
        AngularFireModule.initializeApp({projectId: 'test'}),
        AngularFirestoreModule
      ],
      providers: [
        MediaService,
        {
          provide: AngularFireStorage, useFactory: () => ({
            upload: jest.fn()
        })},
        { provide: Overlay, useFactory: () => ({
            create: () => ({attach: _ => ({}), detach: _ => ({})}),
            position: () => ({ global: () => ({ bottom: () => ({ left: () => true }) }) })
        })},
        { provide: SETTINGS, useValue: { host: 'localhost:8080', ssl: false } }
      ],
    });
    db = TestBed.inject(AngularFirestore);
    storage = TestBed.inject(AngularFireStorage);
    service = TestBed.inject(MediaService);
  });

  afterEach(() => clearFirestoreData({projectId: 'test'}))

  it('Should check media service is created', () => {
    expect(service).toBeTruthy();
  })

  it('Upload a blob & verify storage upload is invoked', async () => {
    TESTDATA.data = new Blob([JSON.stringify({ blockframes: 'movies' })], 
                              { type: 'application/json' });
    await service.upload(TESTDATA);
    expect(storage.upload).toHaveBeenCalled();
  });

  it('Upload a file & verify storage upload is invoked', async () => {
    TESTDATA.data = new File([JSON.stringify({ blockframes: 'movies' })], 
                              'test');
    await service.upload(TESTDATA);
    expect(storage.upload).toHaveBeenCalled();
  });

  it('Verify generated ImgIx URL', async () => {
    const imgParam: ImageParameters = {
      auto: 'format', fit: 'facearea', w: 123, h: 321, page: 99, 
      s: 'FOO123bar'
    }
    const query = formatParameters(imgParam);
    const expURL = `https://${firebase.projectId}-protected.imgix.net/test?${query}`;
    const genURL = await service.generateImgIxUrl('test', imgParam)
    expect(genURL).toBe(expURL);
  });

  it('Verify generated background ImgIx URL', async () => {
    const expURL = `https://${firebase.projectId}.imgix.net/test?w=1024`;
    const genURL = await service.generateBackgroundImageUrl('test', {})
    expect(genURL).toBe(expURL);
  });
});
