import { NotificationDocument } from './data/types';
import * as admin from 'firebase-admin';
import { DocumentMeta } from '@blockframes/utils/models-meta';
import { NotificationType } from '@blockframes/notification/types';
import { getDocument, getOrgAppKey } from './data/internals';
import { User } from '@blockframes/user/types';
import { sendMail /* @TODO #4046 remove import */, sendMailFromTemplate } from './internals/email';
import { getSendgridFrom } from '@blockframes/utils/apps';
import { emailErrorCodes } from '@blockframes/utils/emails/utils';

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
    if (user.settings?.notifications?.default.email) {
      notification.email = {
        isSent: false,
      };
    }

    if (user.settings?.notifications?.default.app) {
      notification.app = {
        isRead: false,
      };
    }

  } else {
    // default is "in app" notifications only
    notification.app = { isRead: false };
  }

  return notification;
}

function createDocumentMeta(meta: Partial<DocumentMeta<Timestamp>> = {}): DocumentMeta<Timestamp> {
  return {
    createdBy: 'internal',
    createdAt: admin.firestore.Timestamp.now(),
    ...meta
  }
}

/** Create a Notification with required and generic information. */
export function createNotification(notification: Partial<NotificationDocument> = {}): NotificationDocument {
  const db = admin.firestore();
  return {
    _meta: createDocumentMeta(),
    type: 'movieAccepted', // We need a default value for backend-function strict mode
    toUserId: '',
    id: db.collection('notifications').doc().id,
    ...notification
  };
}

export async function onNotificationCreate(snap: FirebaseFirestore.DocumentSnapshot): Promise<any> {
  const notification = snap.data() as NotificationDocument;

  if (notification.email?.isSent === false) {
    // Update notification state
    if (customizableNotificationsTypes.includes(notification.type)) {
      const user = await getDocument<User>(`users/${notification.toUserId}`);

      // Send email
      // const appKey = await getOrgAppKey(user.orgId); //@TODO also use notification.type to guess appKey
      // await sendMailFromTemplate({ to: user.email, templateId: 'TODO#4046', data: {} }, appKey); // @TODO #4046
      await sendMail({ to: user.email, subject: notification.type, text: 'test' })
        .then(_ => {
          notification.email.isSent = true;
        }).catch(e => {
          notification.email.error = e.message;
        });
    } else {
      notification.email.error = emailErrorCodes.E04.code;
    }
    const db = admin.firestore();
    await db.collection('notifications').doc(notification.id).set({ email: notification.email }, { merge: true });
  }
}