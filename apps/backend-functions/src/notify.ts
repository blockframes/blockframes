import { db, serverTimestamp } from './internals/firebase';
import {
  BaseNotification,
  Notification,
  SnapObject,
  Invitation,
  BaseInvitation,
  AppIcon
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

/** Takes one or more invitations and add them on the invitations collection */
export function triggerInvitations(invitations: Invitation[]): Promise<any> {
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
    appIcon: notif.docInformations.type === 'delivery' ? AppIcon.mediaDelivering : AppIcon.mediaFinanciers,
    ...notif
  };
}

/** Takes a BaseInvitation (message, userId...), and adds Invitation fields to return a real Invitation */
export function prepareInvitation(invit: BaseInvitation): Invitation {
  return {
    id: db.collection('invitations').doc().id,
    state: 'pending',
    date: serverTimestamp(),
    appIcon: invit.docInformations.type === 'delivery' ? AppIcon.mediaDelivering : AppIcon.mediaFinanciers,
    ...invit
  };
}

/** Create a custom message relying on what is inside the SnapObject (mostly docInformations.type, userId, and count) */
export function customMessage(snap: SnapObject) {
  if (!!snap.count && snap.eventType === 'google.firestore.document.create') {
    if (snap.docInformations.type === 'delivery') {
      return `${snap.organization.name} has been invited to work on ${snap.movie.title.original}'s ${snap.docInformations.type}.`;
    }
    if (snap.docInformations.type === 'movie') {
      return `${snap.organization.name} has been invited to work on ${snap.movie.title.original}.`;
    }
  }
  if (snap.eventType === 'google.firestore.document.delete') {
    if (snap.docInformations.type === 'movie') {
      return `${snap.organization.name} has been removed from movie ${snap.movie.title.original}.`;
    }
    if (snap.docInformations.type === 'delivery') {
      return `${snap.organization.name} has been removed from ${snap.movie.title.original} delivery.`;
    }
    throw new Error('Document type is not defined.');
  }
  throw new Error('Invalid message.');
}

/** Generate a simple string message for the invitation */
export function invitationMessage(snap: SnapObject) {
  if (snap.docInformations.type === 'delivery') {
    return `You have been invited to work on ${snap.movie.title.original}'s delivery. Do you wish to join the teamwork ?`;
  }
  throw new Error('Invalid invitation.');
}
