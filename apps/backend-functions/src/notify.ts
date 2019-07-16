import { db, serverTimestamp } from './firebase';
import { APP_DELIVERY_ICON, APP_MOVIE_ICON } from './utils';
import {
  BaseNotification,
  Notification,
  SnapObject,
  Invitation,
  BaseInvitation
} from './data/types';

/** Takes one or more notifications and add them on the notifications collection */
export async function triggerNotifications(notifications: Notification[]): Promise<any> {
  const batch = db.batch();

  notifications.forEach((notification: Notification) => {
    const notificationRef = db.collection('notifications').doc(notification.id);
    batch.set(notificationRef, notification);
  });

  return batch.commit();
}

/** Takes one or more invitations and add them on the invitations collection */
export async function triggerInvitations(invitations: Invitation[]): Promise<any> {
  const batch = db.batch();

  invitations.forEach((invitation: Invitation) => {
    const invitationRef = db.collection('invitations').doc(invitation.id);
    batch.set(invitationRef, invitation);
  });

  return batch.commit();
}

/** Takes a BaseNotification (message, userId...), and adds Notification fields to return a real Notification */
export function prepareNotification(notif: BaseNotification): Notification {
  return {
    id: db.collection('notifications').doc().id,
    isRead: false,
    date: serverTimestamp(),
    app: notif.docID.type === 'delivery' ? APP_DELIVERY_ICON : APP_MOVIE_ICON,
    ...notif
  };
}

/** Takes a BaseInvitation (message, userId...), and adds Invitation fields to return a real Invitation */
export function prepareInvitation(invit: BaseInvitation): Invitation {
  return {
    id: db.collection('invitations').doc().id,
    state: 'pending',
    date: serverTimestamp(),
    app: invit.docID.type === 'delivery' ? APP_DELIVERY_ICON : APP_MOVIE_ICON,
    ...invit
  };
}

/** Create a custom message relying on what is inside the SnapObject (mostly docID.type, userId, and count) */
export function customMessage(snap: SnapObject) {
  if (!!snap.count && snap.eventType === 'google.firestore.document.create') {
    if (snap.docID.type === 'delivery') {
      return `${snap.org.name} has been invited to work on ${snap.movie.title.original}'s ${
        snap.docID.type
      }.`;
    }
    if (snap.docID.type === 'movie') {
      return `${snap.org.name} has been invited to work on ${snap.movie.title.original}.`;
    }
  }
  if (snap.eventType === 'google.firestore.document.delete') {
    if (snap.docID.type === 'movie') {
      return `${snap.org.name} has been removed from movie ${snap.movie.title.original}.`;
    }
    if (snap.docID.type === 'delivery') {
      return `${snap.org.name} has been removed from ${snap.movie.title.original} delivery.`;
    }
    throw new Error('Document type is not defined.');
  }
  throw new Error('Invalid message.');
}

/** Generate a simple string message for the invitation */
export function invitationMessage(snap: SnapObject) {
  if (snap.docID.type === 'delivery') {
    return `You have been invited to work on ${
      snap.movie.title.original
    }'s delivery. Do you wish to join the teamwork ?`;
  }
  throw new Error('Invalid invitation.');
}
