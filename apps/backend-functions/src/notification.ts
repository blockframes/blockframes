import { NotificationDocument } from './data/types';
import * as admin from 'firebase-admin';
import { DocumentMeta } from '@blockframes/utils/models-meta';
import { NotificationMeta } from '@blockframes/notification/types';

type Timestamp = admin.firestore.Timestamp;

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

function createDocumentMeta<D>(meta: Partial<DocumentMeta<Timestamp>> = {}): DocumentMeta<Timestamp> {
  return {
    createdBy: '',
    createdAt: admin.firestore.Timestamp.now(), 
    ...meta
  }
}

function createNotificationMeta(meta: Partial<NotificationMeta<Timestamp>> = {}): NotificationMeta<Timestamp> {
  return {
    ...createDocumentMeta(meta),
    email: {
      active: false,
      sent: false,
    },
    app: {
      active: true,
      isRead: false,
    },
    ...meta,
    createdBy: 'internal' // Always created in backend
  }
}

/** Create a Notification with required and generic information. */
export function createNotification(notification: Partial<NotificationDocument> = {}): NotificationDocument {
  const db = admin.firestore();
  return {
    _meta: createNotificationMeta(),
    type: 'movieAccepted', // We need a default value for backend-function strict mode
    toUserId: '',
    id: db.collection('notifications').doc().id,
    ...notification
  };
}
