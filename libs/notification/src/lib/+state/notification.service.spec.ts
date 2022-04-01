import { TestBed } from '@angular/core/testing';
import { NotificationService } from './notification.service';
import { Notification } from '@blockframes/shared/model';
import { AngularFireModule } from '@angular/fire';
import { SETTINGS, AngularFirestoreModule, AngularFirestore } from '@angular/fire/firestore';
import { loadFirestoreRules, clearFirestoreData } from '@firebase/rules-unit-testing';
import { readFileSync } from 'fs';
import { HttpClient } from '@angular/common/http';
import { HttpTestingController } from '@angular/common/http/testing';
import { AngularFireAuth } from '@angular/fire/auth';
import { Observable } from 'rxjs';
import { UserService } from '@blockframes/user/+state/user.service';
import { RouterTestingModule } from '@angular/router/testing';
import { ModuleGuard } from '@blockframes/utils/routes/module.guard';
import { APP } from '@blockframes/utils/routes/utils';
import { MovieService } from '@blockframes/movie/+state/movie.service';
import { ContractService } from '@blockframes/contract/contract/+state';

class InjectedAngularFireAuth {
  authState = new Observable();
}

class InjectedModuleGuard {
  currentModule = 'dashboard';
}

class DummyService {}

describe('Notifications Test Suite', () => {
  let service: NotificationService;
  let db: AngularFirestore;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [AngularFireModule.initializeApp({ projectId: 'test' }), AngularFirestoreModule, RouterTestingModule],
      providers: [
        NotificationService,
        { provide: HttpClient, useClass: HttpTestingController },
        { provide: AngularFireAuth, useClass: InjectedAngularFireAuth },
        { provide: UserService, useClass: DummyService },
        { provide: MovieService, useClass: DummyService },
        { provide: ContractService, useClass: DummyService },
        { provide: ModuleGuard, useClass: InjectedModuleGuard },
        { provide: APP, useValue: 'festival' },
        { provide: SETTINGS, useValue: { host: 'localhost:8080', ssl: false } },
      ],
    });
    db = TestBed.inject(AngularFirestore);
    service = TestBed.inject(NotificationService);

    await loadFirestoreRules({
      projectId: 'test',
      rules: readFileSync('./firestore.test.rules', 'utf8'),
    });
  });

  afterEach(() => clearFirestoreData({ projectId: 'test' }));

  // To prevent "This usually means that there are asynchronous operations that weren't stopped in your tests. Consider running Jest with `--detectOpenHandles` to troubleshoot this issue."
  afterAll(() => db.firestore.disableNetwork());

  it('Should check notif service is created', () => {
    expect(service).toBeTruthy();
  });

  it('Should mark notifications as read', async () => {
    const notif = {
      id: '1',
      app: { isRead: false },
    };
    await db.doc('notifications/1').set(notif);
    await service.readNotification(notif);
    const doc = await db.doc('notifications/1').ref.get();
    const notification = doc.data() as Notification;
    expect(notification.app.isRead).toBeTruthy();
  });
});
