import { TestBed } from '@angular/core/testing';
import { ConsentsService } from './consents.service';
import { Consents } from './consents.firestore';
import { AngularFireModule } from '@angular/fire';
import { SETTINGS, AngularFirestoreModule, AngularFirestore } from '@angular/fire/firestore';
import { clearFirestoreData, loadFirestoreRules } from '@firebase/testing';
import { readFileSync } from 'fs';
import { IpService } from '@blockframes/utils/ip';
import { AngularFireFunctions, REGION, USE_EMULATOR as USE_FUNCTIONS_EMULATOR } from '@angular/fire/functions';
import { firebaseRegion } from '@env';

class MockIpService {
  public get(): Promise<string> {
    return new Promise(async (res) => {
      res('127.0.0.1');
    })
  }
}

// @TODO #4913 Need to remove skipInMaintenanceCheck
// need to pass auth context to httpsCallable
// must use actual projectId to work (blockframes-bruce for example) https://github.com/firebase/firebase-tools/issues/1960

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
        { provide: IpService, useClass: MockIpService },
        { provide: AngularFireFunctions, useClass: AngularFireFunctions },
        { provide: SETTINGS, useValue: { host: 'localhost:8080', ssl: false } },
        { provide: REGION, useValue: firebaseRegion },
        { provide: USE_FUNCTIONS_EMULATOR, useValue: ['localhost', 5001] }
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

  test('Should check if the consent service is created', () => {
    expect(service).toBeTruthy();
  })

  test.skip('Should check if the consent is created on db with expected values', async () => {
    await service.createConsent('share', '1');
    const doc = await db.doc('consents/1').ref.get();
    const consents = doc.data() as Consents<Date>;
    expect(consents.share[0].ip).toEqual('127.0.0.1');
  });

});
