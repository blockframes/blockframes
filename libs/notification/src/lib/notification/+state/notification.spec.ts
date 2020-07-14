import {TestBed} from '@angular/core/testing';

import { NotificationService } from './notification.service';
import { NotificationStore } from './notification.store';
import { AngularFirestore } from '@angular/fire/firestore';
import { Notification } from './notification.model';

const AngularFirestoreStub = {
  collection: (name: string) => {
  },
  formatNotification : (notification) => ({
    format: JSON.stringify(notification)
  })
};

describe('Notifications tests', () => {
  let notifService: NotificationService;
  const notif: Notification = {
    type: 'newContract',
    toUserId: "",
    id: "",
    isRead: false,
    message: "Jest Notify",
    date: new Date()
  };
  
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        NotificationService, 
        {provide: NotificationStore, useValue: AngularFirestoreStub},
        {provide: AngularFirestore, useValue: AngularFirestoreStub}
      ],
    });
    notifService = TestBed.get(NotificationService);
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