import { TestBed } from '@angular/core/testing';
import { ConsentsService } from './consents.service';
import { AngularFireModule } from '@angular/fire';
import { SETTINGS, AngularFirestoreModule, AngularFirestore } from '@angular/fire/firestore';
import { clearFirestoreData, loadFirestoreRules } from '@firebase/rules-unit-testing';
import { readFileSync } from 'fs';
import { IpService } from '@blockframes/utils/ip';
import { REGION, USE_EMULATOR as USE_FUNCTIONS_EMULATOR } from '@angular/fire/functions';
import { firebaseRegion } from '@env';

const projectIdUT = 'test-consents-ut';

class MockIpService {
  public get(): Promise<string> {
    return new Promise((res) => {
      res('127.0.0.1');
    })
  }
}

describe('Consents when user click on the button', () => {
  let service: ConsentsService;
  let db: AngularFirestore;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [
        AngularFireModule.initializeApp({ projectId: projectIdUT }),
        AngularFirestoreModule
      ],
      providers: [
        ConsentsService,
        { provide: IpService, useClass: MockIpService },
        { provide: SETTINGS, useValue: { host: 'localhost:8080', ssl: false } },
        { provide: REGION, useValue: firebaseRegion },
        { provide: USE_FUNCTIONS_EMULATOR, useValue: ['localhost', 5001] }
      ],
    });
    db = TestBed.inject(AngularFirestore);
    service = TestBed.inject(ConsentsService);

    await loadFirestoreRules({
      projectId: projectIdUT,
      rules: readFileSync('./firestore.test.rules', "utf8")
    });

  });
  afterEach(() => clearFirestoreData({ projectId: projectIdUT }));

  // To prevent "This usually means that there are asynchronous operations that weren't stopped in your tests. Consider running Jest with `--detectOpenHandles` to troubleshoot this issue."
  afterAll(() => db.firestore.disableNetwork());

  test('Should check if the consent service is created', () => {
    expect(service).toBeTruthy();
  })

});
