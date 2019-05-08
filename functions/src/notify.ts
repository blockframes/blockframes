import { db, serverTimestamp } from './firebase';

interface PartialNotification {
  app: string;
  message: string;
  userId: string;
  path?: string;
  docId?: string;
  stakeholderId?: string;
}

interface Notification extends PartialNotification {
  id: string;
  isRead: boolean;
  date: any;
}

export async function triggerNotifications(notifications: Notification[]): Promise<any> {
  const notificationBatch = db.batch();

  notifications.forEach(notification => {
    const notificationRef = db.collection('notifications').doc(notification.id);
    notificationBatch.set(notificationRef, notification);
  });

  return notificationBatch.commit();
}

export function prepareNotification(notif: PartialNotification): Notification {
  return {
    ...notif,
    id: db.collection('notifications').doc().id,
    isRead: false,
    date: serverTimestamp()
  };
}
