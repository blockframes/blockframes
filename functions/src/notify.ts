import { db, serverTimestamp } from './firebase';

interface PartialNotification {
  app: string;
  message: string;
  userId: string;
  path: string | null;
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

export function prepareNotification({ app, message, userId, path }: PartialNotification): Notification {
  return {
    id: db.collection('notifications').doc().id,
    app,
    message,
    userId,
    path: path || null,
    isRead: false,
    date: serverTimestamp()
  };
}
