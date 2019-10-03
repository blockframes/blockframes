import { db, serverTimestamp } from './internals/firebase';
import {
  App,
  BaseNotification,
  Notification,
  SnapObject
} from './data/types';

/** Takes one or more notifications and add them on the notifications collection */
export function triggerNotifications(notifications: Notification[]): Promise<any> {
  const batch = db.batch();

  notifications.forEach((notification: Notification) => {
    const notificationRef = db.collection('notifications').doc(notification.id);
    batch.set(notificationRef, notification);
  });

  return batch.commit();
}

/** Takes a BaseNotification (message, userId...), and adds Notification fields to return a real Notification */
export function prepareNotification(notif: BaseNotification): Notification {
  return {
    id: db.collection('notifications').doc().id,
    isRead: false,
    date: serverTimestamp(),
    appIcon:
      notif.docInformations.type === 'delivery' || notif.docInformations.type === null
        ? App.mediaDelivering
        : App.mediaFinanciers,
    ...notif
  };
}

/** Create a custom message relying on what is inside the SnapObject (mostly docInformations.type, userId, and count) */
export function customMessage(snap: SnapObject) {
  if (!!snap.count && snap.eventType === 'google.firestore.document.create') {
    if (snap.docInformations.type === 'delivery') {
      return `${snap.organization.name} has been invited to work on ${snap.movie.main.title.original}'s ${snap.docInformations.type}.`;
    }
    if (snap.docInformations.type === 'movie') {
      return `${snap.organization.name} has been invited to work on ${snap.movie.main.title.original}.`;
    }
  }
  if (snap.eventType === 'google.firestore.document.delete') {
    if (snap.docInformations.type === 'movie') {
      return `${snap.organization.name} has been removed from movie ${snap.movie.main.title.original}.`;
    }
    if (snap.docInformations.type === 'delivery') {
      return `${snap.organization.name} has been removed from ${snap.movie.main.title.original} delivery.`;
    }
    throw new Error('Document type is not defined.');
  }
  throw new Error('Invalid message.');
}
