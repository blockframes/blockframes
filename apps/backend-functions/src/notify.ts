import { db, serverTimestamp } from './firebase';

export interface DocID {
  id: string,
  type : 'movie' | 'delivery'
}

interface PartialNotification {
  app: string;
  message: string;
  userId: string;
  path?: string;
  docID?: DocID;
  stakeholderId?: string;
}

interface Notification extends PartialNotification {
  id: string;
  isRead: boolean;
  date: any;
}

interface SnapObject {
  movieTitle: string,
  docID: DocID,
  stakeholderId: string,
  orgName: string,
  count: number,
  userIds: string[]
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
    id: db.collection('notifications').doc().id,
    isRead: false,
    date: serverTimestamp(),
    ...notif
  } as Notification;
}

export function customMessage(userId: string, snap: SnapObject) {
  if (snap.docID.type === 'delivery') {
    return snap.userIds.includes(userId) && snap.count > 1
      ? `You have been invited to work on ${snap.movieTitle}'s ${snap.docID.type}. Do you wish to work on it ?`
      : `${snap.orgName} has been added to ${snap.movieTitle}'s ${snap.docID.type}`;
    }
  if (snap.docID.type === 'movie') {
    return snap.userIds.includes(userId) && snap.count > 1
      ? `You have been invited to work on ${snap.movieTitle}. Do you wish to work on it ?`
      : `${snap.orgName} has been added to ${snap.movieTitle}`;
  } else {
    throw new Error('Message is not valid');
  }
}
