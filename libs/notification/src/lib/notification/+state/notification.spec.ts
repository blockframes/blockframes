import {TestBed} from '@angular/core/testing';

import { NotificationService } from './notification.service';
import { NotificationStore } from './notification.store';
import { AngularFirestore } from '@angular/fire/firestore';
import { Notification } from './notification.model';
import * as firebase from '@firebase/testing';

const NotificationStoreStub = {
  formatNotification : (notification) => ({
    format: JSON.stringify(notification)
  })
};

let testIndex = 0;

describe('Notifications Test Suite', () => {
  let notifService: NotificationService;
  let projectId;
  const notif: Notification = {
    type: 'newContract',
    toUserId: "",
    id: "",
    isRead: false,
    message: "Jest Notify",
    date: new Date()
  };
  
  beforeEach(async () => {
    projectId = 'test' + testIndex++;
    firebase.initializeTestApp({ projectId });

    TestBed.configureTestingModule({
      providers: [
        NotificationService, 
        {provide: NotificationStore, useValue: NotificationStoreStub},
        {provide: AngularFirestore }
      ],
    });
    notifService = TestBed.inject(NotificationService);
  });  

  afterEach(async () => {
    await firebase.clearFirestoreData({ projectId });
  });

  it('should create notification service', () => {
    expect(notifService).toBeTruthy();
  });

  it('reads notification', () => {
    notifService.update = jest.fn();
    notifService.readNotification(notif);
    expect(notifService.update).toHaveBeenCalled();
  });

  it('formats notification', () => {
    const newNotif = notifService.formatFromFirestore(notif);
    expect(newNotif).toEqual({ ...notif, format: JSON.stringify(notif)});
  });
})
