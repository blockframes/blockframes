process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
import { TestBed } from '@angular/core/testing';
import { NotificationService } from './notification.service';
import { Notification } from '@blockframes/model';
import { initializeTestEnvironment } from '@firebase/rules-unit-testing';
import { clearFirestoreData } from 'firebase-functions-test/lib/providers/firestore';
import { readFileSync } from 'fs';
import { HttpClient } from '@angular/common/http';
import { HttpTestingController } from '@angular/common/http/testing';
import { Observable } from 'rxjs';
import { UserService } from '@blockframes/user/service';
import { AnalyticsService } from '@blockframes/analytics/service';
import { MovieService } from '@blockframes/movie/service';
import { ContractService } from '@blockframes/contract/contract/service';
import { ModuleGuard } from '@blockframes/utils/routes/module.guard';
import { AuthService } from '@blockframes/auth/service';
import { APP } from '@blockframes/utils/routes/utils';
import { connectFirestoreEmulator, disableNetwork, doc, Firestore, getDoc, setDoc } from 'firebase/firestore';
import { FIREBASE_CONFIG, FirestoreService, FIRESTORE_SETTINGS } from 'ngfire';

class DummyAuthService {
  profile$ = new Observable();
}

class InjectedModuleGuard {
  currentModule = 'dashboard';
}

class DummyService { }

describe('Notifications Test Suite', () => {
  let service: NotificationService;
  let db: Firestore;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        NotificationService,
        FirestoreService,
        { provide: HttpClient, useClass: HttpTestingController },
        { provide: AuthService, useClass: DummyAuthService },
        { provide: UserService, useClass: DummyService },
        { provide: MovieService, useClass: DummyService },
        { provide: AnalyticsService, useClass: DummyService },
        { provide: ContractService, useClass: DummyService },
        { provide: ModuleGuard, useClass: InjectedModuleGuard },
        { provide: APP, useValue: 'festival' },
        {
          provide: FIREBASE_CONFIG, useValue:
          {
            options: { projectId: 'test' },
            firestore: (firestore: Firestore) => {
              if (db) return db;
              connectFirestoreEmulator(firestore, 'localhost', 8080);
            }
          }
        },
        { provide: FIRESTORE_SETTINGS, useValue: { ignoreUndefinedProperties: true, experimentalAutoDetectLongPolling: true } }
      ],
    });
    service = TestBed.inject(NotificationService);
    const firestore = TestBed.inject(FirestoreService);
    db = firestore.db;

    await initializeTestEnvironment({
      projectId: 'test',
      firestore: { rules: readFileSync('./firestore.test.rules', 'utf8') }
    });
  });

  afterEach(() => clearFirestoreData({ projectId: 'test' }));

  // To prevent "This usually means that there are asynchronous operations that weren't stopped in your tests. Consider running Jest with `--detectOpenHandles` to troubleshoot this issue."
  afterAll(() => disableNetwork(db));

  it('Should check notif service is created', () => {
    expect(service).toBeTruthy();
  })

  it('Should mark notifications as read', async () => {
    const notif = {
      id: '1',
      app: { isRead: false },
    };
    const ref = doc(db, 'notifications/1');
    await setDoc(ref, notif);
    await service.readNotification(notif);
    const document = await getDoc(ref);
    const notification = document.data() as Notification;
    expect(notification.app.isRead).toBeTruthy();
  });

});
