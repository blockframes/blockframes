﻿import { TestBed } from '@angular/core/testing';

import { NotificationService } from './notification.service';
import { NotificationStore } from './notification.store';
import { Notification } from './notification.model';
import { AngularFireModule } from '@angular/fire';
import { SETTINGS, AngularFirestoreModule, AngularFirestore } from '@angular/fire/firestore';
import { loadFirestoreRules, clearFirestoreData } from '@firebase/testing';
import { readFileSync } from 'fs';
import { AuthService } from '@blockframes/auth/+state';
import { Subject } from 'rxjs';

// @TODO (#4564) replace this mock by actual AuthService
class MockAuthService {
  signedOut = new Subject<void>();
}

describe('Notifications Test Suite', () => {
  let service: NotificationService;
  let db: AngularFirestore;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [
        AngularFireModule.initializeApp({ projectId: 'test' }),
        AngularFirestoreModule
      ],
      providers: [
        NotificationService,
        NotificationStore,
        { provide: AuthService, useClass: MockAuthService },
        { provide: SETTINGS, useValue: { host: 'localhost:8080', ssl: false } }
      ],
    });
    db = TestBed.inject(AngularFirestore);
    service = TestBed.inject(NotificationService);

    await loadFirestoreRules({
      projectId: "test",
      rules: readFileSync('./firestore.test.rules', "utf8")
    });
  });

  afterEach(() => clearFirestoreData({ projectId: 'test' }));

  // To prevent "This usually means that there are asynchronous operations that weren't stopped in your tests. Consider running Jest with `--detectOpenHandles` to troubleshoot this issue."
  afterAll(() => db.firestore.disableNetwork());

  it('Should check notif service is created', () => {
    expect(service).toBeTruthy();
  })

  it('Should mark notifications as read', async () => {
    await db.doc('notifications/1').set({ isRead: false });
    await service.readNotification({ id: '1' });
    const doc = await db.doc('notifications/1').ref.get();
    const notification = doc.data() as Notification;
    expect(notification.isRead).toBeTruthy();
  });

  it('Formats notification', () => {
    const notificationStore = TestBed.inject(NotificationStore)
    notificationStore.formatNotification = jest.fn();
    service.formatFromFirestore({} as any);
    expect(notificationStore.formatNotification).toHaveBeenCalled();
  });
});
