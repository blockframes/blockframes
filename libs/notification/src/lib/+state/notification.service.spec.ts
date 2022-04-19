process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
import { TestBed } from '@angular/core/testing';
import { NotificationService } from './notification.service';
import { Notification } from '@blockframes/model';
import { getApp, initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { provideFirestore, initializeFirestore, connectFirestoreEmulator, doc, setDoc, getDoc, disableNetwork, Firestore } from '@angular/fire/firestore';
import { loadFirestoreRules, clearFirestoreData } from '@firebase/rules-unit-testing';
import { readFileSync } from 'fs';
import { HttpClient } from '@angular/common/http';
import { HttpTestingController } from '@angular/common/http/testing';
import { Observable } from 'rxjs';
import { UserService } from '@blockframes/user/+state/user.service';
import { AnalyticsService } from '@blockframes/analytics/+state/analytics.service';
import { MovieService } from '@blockframes/movie/+state/movie.service';
import { ContractService } from '@blockframes/contract/contract/+state';
import { RouterTestingModule } from "@angular/router/testing";
import { ModuleGuard } from '@blockframes/utils/routes/module.guard';
import { APP } from '@blockframes/utils/routes/utils';
import { connectFunctionsEmulator, getFunctions, provideFunctions } from '@angular/fire/functions';
import { Auth } from '@angular/fire/auth';

class InjectedAngularFireAuth {
  authState = new Observable();
}

class InjectedModuleGuard {
  currentModule = 'dashboard'
}

class DummyService { }

describe('Notifications Test Suite', () => {
  let service: NotificationService;
  let db: Firestore;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [
        provideFirebaseApp(() => initializeApp({ projectId: 'test' })),
        provideFirestore(() => {
          if(db) return db;
          db = initializeFirestore(getApp(), { experimentalAutoDetectLongPolling: true });
          connectFirestoreEmulator(db, 'localhost', 8080);
          return db;
        }),
        provideFunctions(() => {
          const functions = getFunctions(getApp());
          connectFunctionsEmulator(functions, 'localhost', 5001);
          return functions;
        }),
        RouterTestingModule,
      ],
      providers: [
        NotificationService,
        { provide: HttpClient, useClass: HttpTestingController },
        { provide: Auth, useClass: InjectedAngularFireAuth },
        { provide: UserService, useClass: DummyService },
        { provide: MovieService, useClass: DummyService },
        { provide: AnalyticsService, useClass: DummyService },
        { provide: ContractService, useClass: DummyService },
        { provide: ModuleGuard, useClass: InjectedModuleGuard },
        { provide: APP, useValue: 'festival' },
      ],
    });
    db = TestBed.inject(Firestore);
    service = TestBed.inject(NotificationService);

    await loadFirestoreRules({
      projectId: "test",
      rules: readFileSync('./firestore.test.rules', "utf8")
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
