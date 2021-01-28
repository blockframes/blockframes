import { MovieDocument, NotificationDocument, OrganizationDocument } from './data/types';
import * as admin from 'firebase-admin';
import { DocumentMeta } from '@blockframes/utils/models-meta';
import { NotificationType } from '@blockframes/notification/types';
import { getDocument, getOrgAppKey } from './data/internals';
import { NotificationSettingsTemplate, User } from '@blockframes/user/types';
import { sendMail /* @TODO #4046 remove import */, sendMailFromTemplate } from './internals/email';
import { emailErrorCodes, getEventEmailData } from '@blockframes/utils/emails/utils';
import { EventDocument, Screening } from '@blockframes/event/+state/event.firestore';
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
  const types: NotificationType[] = ['memberAddedToOrg', 'memberRemovedFromOrg', 'oneDayReminder', 'eventIsAboutToStart'];

  if (notification.email?.isSent === false) {
    // Update notification state
    if (types.includes(notification.type)) {
      const user = await getDocument<User>(`users/${notification.toUserId}`);

      switch (notification.type) {
        case 'eventIsAboutToStart' :
          await sendReminderEmails(notification, templateIds.eventReminder.oneHour);
          break;
        case 'oneDayReminder' :
          await sendReminderEmails(notification, templateIds.eventReminder.oneDay);
          break;
        default:
          await sendMail({ to: user.email, subject: notification.type, text: 'test' })
          .then(_ => notification.email.isSent = true)
          .catch(e => notification.email.error = e.message);
          break;
      }
    } else {
      notification.email.error = emailErrorCodes.noTemplate.code;
    }
    const db = admin.firestore();
    await db.collection('notifications').doc(notification.id).set({ email: notification.email }, { merge: true });
  }
}

/** Send e reminder email 24h or 1h before event starts */
async function sendReminderEmails(notification, template: string) {
  const user = await getDocument<User>(`users/${notification.toUserId}`);
  const event = await getDocument<EventDocument<Screening>>(`events/${notification.docId}`);
  const org = await getDocument<OrganizationDocument>(`orgs/${event.ownerId}`);
  const eventData = getEventEmailData(event);
  const movie = await getDocument<MovieDocument>(`movies/${event.meta.titleId}`);
  const app = await getOrgAppKey(org)

  const email = reminderEventToUser(movie.title.international, user, orgName(org), eventData, template);
  return await sendMailFromTemplate(email, app)
  .then(_ => notification.email.isSent = true)
  .catch(e => notification.email.error = e.message);
}
