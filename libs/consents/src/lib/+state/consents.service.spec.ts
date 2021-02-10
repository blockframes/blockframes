import { TestBed } from '@angular/core/testing';

import { ConsentsService } from './consents.service';
import { Consents } from './consents.firestore';
import { ConsentsStore } from './consents.store';
import { AngularFireModule } from '@angular/fire';
import { SETTINGS, AngularFirestoreModule, AngularFirestore } from '@angular/fire/firestore';
import { loadFirestoreRules, clearFirestoreData } from '@firebase/testing';
import { readFileSync } from 'fs';

// class MockAuthService {
//   signedOut = new Subject<void>();
// }

describe('Consents when user click on the button', () => {
  let service: ConsentsService;
  let db: AngularFirestore;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [
        AngularFireModule.initializeApp({ projectId: 'test' }),
        AngularFirestoreModule
      ],
      providers: [
        ConsentsService,
        ConsentsStore,

        { provide: SETTINGS, useValue: { host: 'localhost:8080', ssl: false } }
      ],
    });
    db = TestBed.inject(AngularFirestore);
    service = TestBed.inject(ConsentsService);

    await loadFirestoreRules({
      projectId: "test",
      rules: readFileSync('./firestore.test.rules', "utf8")
    });

  });
  afterEach(() => clearFirestoreData({ projectId: 'test' }));

  // To prevent "This usually means that there are asynchronous operations that weren't stopped in your tests. Consider running Jest with `--detectOpenHandles` to troubleshoot this issue."
  afterAll(() => db.firestore.disableNetwork());

  test('Should check if the user/org consent service is created', () => {
    expect(service).toBeTruthy();
  })

  test('Should check if the consent is read', async () => {
    const consent = {
      id: '1',
      access: [],
      share: [],
    };
    await db.doc('consents/1').set(consent);
    await service.createConsent('share', '1');
    const doc = await db.doc('consents/1').ref.get();
    const consents = doc.data() as Consents<Date>;
    expect(consents.share).toBeTruthy();
  });

  test('Formats notification', () => {
    const consentsStore = TestBed.inject(ConsentsStore)
    consentsStore._cache = jest.fn();
    service.formatFromFirestore({} as any);
    expect(consentsStore).toHaveBeenCalled();
  });


});
