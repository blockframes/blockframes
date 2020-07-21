﻿import {TestBed} from '@angular/core/testing';

import { NotificationService } from './notification.service';
import { NotificationStore } from './notification.store';
import { AngularFireModule } from '@angular/fire';
import { SETTINGS, AngularFirestoreModule, AngularFirestore } from '@angular/fire/firestore';
import { loadFirestoreRules, clearFirestoreData } from '@firebase/testing';
import { readFileSync } from 'fs';

describe('Notifications Test Suite', () => {
  let service: NotificationService;
  let db: AngularFirestore;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [
        AngularFireModule.initializeApp({projectId: 'test'}),
        AngularFirestoreModule
      ],
      providers: [
        NotificationService,
        NotificationStore,
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

  afterEach(() => clearFirestoreData({projectId: 'test'}))

  it('Should check notif service is created', () => {
    expect(service).toBeTruthy();
  })

  it('Should mark notifications as read', async () => {
    await db.doc('notifications/1').set({ isRead: false });
    await service.readNotification({ id: '1' });
    const doc = await db.doc('notifications/1').ref.get();
    expect(doc.data().isRead).toBeTruthy();
  });

  it('Formats notification', () => {
    const ns = TestBed.inject(NotificationStore)
    ns.formatNotification = jest.fn();
    service.formatFromFirestore({} as any);
    expect(ns.formatNotification).toHaveBeenCalled();
  });
});
