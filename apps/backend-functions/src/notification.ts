import { NotificationDocument } from './data/types';
import * as admin from 'firebase-admin';
import { DocumentMeta } from '@blockframes/utils/models-meta';
import { NotificationMeta, NotificationType } from '@blockframes/notification/types';
import { getDocument } from './data/internals';
import { User } from '@blockframes/user/types';

type Timestamp = admin.firestore.Timestamp;

/** Takes one or more notifications and add them on the notifications collection */
export async function triggerNotifications(notifications: NotificationDocument[]): Promise<any> {
  const db = admin.firestore();
  const batch = db.batch();

  for (const n of notifications) {
    const notification = await appendNotificationSettings(n);

    const notificationRef = db.collection('notifications').doc(notification.id);
    batch.set(notificationRef, notification);
  }

  return batch.commit();
}

// @TODO #4046 should contain all notificationTypes in the end
const customizableNotificationsTypes: NotificationType[] = ['memberAddedToOrg', 'memberRemovedFromOrg'];

async function appendNotificationSettings(notification: NotificationDocument) {
  // get user notification settings
  const user = await getDocument<User>(`users/${notification.toUserId}`);

  if (customizableNotificationsTypes.includes(notification.type)) {
    // @TODO #4046 add other checks with notification.type
    if (user.notificationsSettings?.email) {
      notification._meta.email.active = true;
    }

    if (user.notificationsSettings?.app) {
      notification._meta.app.active = true;
    }

  } else {
    // default is "in app" notifications only
    notification._meta.app.active = true;
    notification._meta.email.active = false;
  }

  return notification;
}

function createDocumentMeta(meta: Partial<DocumentMeta<Timestamp>> = {}): DocumentMeta<Timestamp> {
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
      active: false,
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
