import { NotificationDocument, NotificationOptions } from './data/types';
import { db, serverTimestamp } from './internals/firebase'

/** Createa a Notification with required and generic informations. */
export function createNotification(notification: NotificationOptions): NotificationDocument {
  return {
    id: db.collection('notifications').doc().id,
    isRead: false,
    date: serverTimestamp(),
    ...notification
  };
}

/** Takes one or more notifications and add them on the notifications collection */
export function triggerNotifications(notifications: NotificationDocument[]): Promise<any> {
  const batch = db.batch();

  notifications.forEach((notification: NotificationDocument) => {
    const notificationRef = db.collection('notifications').doc(notification.id);
    batch.set(notificationRef, notification);
  });

  return batch.commit();
}
