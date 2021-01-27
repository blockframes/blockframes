import { NotificationDocument, OrganizationDocument } from './data/types';
import * as admin from 'firebase-admin';
import { DocumentMeta } from '@blockframes/utils/models-meta';
import { NotificationType } from '@blockframes/notification/types';
import { getDocument, getOrgAppKey } from './data/internals';
import { NotificationSettingsTemplate, User } from '@blockframes/user/types';
import { sendMail /* @TODO #4046 remove import */, sendMailFromTemplate } from './internals/email';
import { getSendgridFrom } from '@blockframes/utils/apps';
import { emailErrorCodes, getEventEmailData } from '@blockframes/utils/emails/utils';
import { EventDocument, EventMeta } from '@blockframes/event/+state/event.firestore';
import { reminderEventToUser } from './templates/mail';
import { templateIds } from './templates/ids';
import { orgName } from '@blockframes/organization/+state/organization.firestore';

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

async function appendNotificationSettings(notification: NotificationDocument) {
  // get user notification settings
  const user = await getDocument<User>(`users/${notification.toUserId}`);

  const updateNotif = ({ email, app }: NotificationSettingsTemplate) => {
    if (email) notification.email = { isSent: false };
    if (app) notification.app = { isRead: false };
  }
  if (!user.settings?.notifications?.default) {
    updateNotif({ app: true, email: false });
  } else if (notification.type in user.settings.notifications) {
    updateNotif(user.settings.notifications[notification.type])
  } else {
    updateNotif(user.settings.notifications.default);
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
  // @TODO #4046 should contain all notificationTypes in the end
  const types: NotificationType[] = ['memberAddedToOrg', 'memberRemovedFromOrg'];

  if (notification.email?.isSent === false) {
    // Update notification state
    if (types.includes(notification.type)) {
      const user = await getDocument<User>(`users/${notification.toUserId}`);

      if (notification.type === 'oneDayReminder') {
        // Send reminder email to invited users a day before event start
        const event = await getDocument<EventDocument<EventMeta>>(`events/${notification.docId}`);
        const org = await getDocument<OrganizationDocument>(`orgs/${event.ownerId}`);
        const eventData = getEventEmailData(event);

        const template = reminderEventToUser(user, orgName(org), eventData, templateIds.eventReminder.oneDay);
        await sendMailFromTemplate(template, 'festival') // TODO guess appKey
        .then(_ => { notification.email.isSent = true })
        .catch(e => { notification.email.error = e.message });
      }

      if (notification.type === 'eventIsAboutToStart') {
        // Send reminder email to invited users a day before event start
        const event = await getDocument<EventDocument<EventMeta>>(`events/${notification.docId}`);
        const org = await getDocument<OrganizationDocument>(`orgs/${event.ownerId}`);
        const eventData = getEventEmailData(event);

        const template = reminderEventToUser(user, orgName(org), eventData, templateIds.eventReminder.oneHour);
        await sendMailFromTemplate(template, 'festival') // TODO guess appKey
        .then(_ => { notification.email.isSent = true })
        .catch(e => { notification.email.error = e.message });
      }

      // Send email
      // const appKey = await getOrgAppKey(user.orgId); //@TODO also use notification.type to guess appKey
      // await sendMailFromTemplate({ to: user.email, templateId: 'TODO#4046', data: {} }, appKey); // @TODO #4046
      await sendMail({ to: user.email, subject: notification.type, text: 'test' })
        .then(_ => notification.email.isSent = true)
        .catch(e => notification.email.error = e.message);
    } else {
      notification.email.error = emailErrorCodes.noTemplate.code;
    }
    const db = admin.firestore();
    await db.collection('notifications').doc(notification.id).set({ email: notification.email }, { merge: true });
  }
}
