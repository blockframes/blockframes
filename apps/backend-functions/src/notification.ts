import { NotificationDocument } from './data/types';
import * as admin from 'firebase-admin';

/** Takes one or more notifications and add them on the notifications collection */
export function triggerNotifications(notifications: NotificationDocument[]): Promise<any> {
  const db = admin.firestore();
  const batch = db.batch();

  notifications.forEach((notification: NotificationDocument) => {
    const notificationRef = db.collection('notifications').doc(notification.id);
    batch.set(notificationRef, notification);
  });

  return batch.commit();
}

/** Create a Notification with required and generic information. */
export function createNotification(notification: Partial<NotificationDocument> = {}): NotificationDocument {
  const db = admin.firestore();
  return {
    type: 'movieAccepted', // We need a default value for backend-function strict mode
    toUserId: '',
    id: db.collection('notifications').doc().id,
    isRead: false,
    date: admin.firestore.Timestamp.now(),
    ...notification
  };
}
