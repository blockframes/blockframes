import { PublicOrganization } from '@blockframes/organization/types';
import { PublicMovie } from '@blockframes/movie/types';
import * as admin from 'firebase-admin';
import { App } from '@blockframes/movie/movie/static-model/staticModels';

/** Type of Notification depending of its origin. */
export const enum NotificationType {
  newSignature = 'newSignature',
  finalSignature = 'finalSignature',
  createDocument = 'createDocument',
  deleteDocument = 'deleteDocument',
  inviteOrganization = 'inviteOrganization',
  removeOrganization = 'removeOrganization',
  pathToDocument = 'pathToDocument'
}

/** Minimum required informations to create a Notification. */
export interface NotificationOptions {
  userId: string;
  docId: string;
  type: NotificationType;
  movie: PublicMovie;
  organization?: PublicOrganization;
}

/** Generic informations for a Notification. */
export interface NotificationDocument extends NotificationOptions {
  id: string;
  app: string;
  isRead: boolean;
  date: FirebaseFirestore.FieldValue;
};

/** Createa a Notification with required and generic informations. */
export function createNotification(notification: NotificationOptions): NotificationDocument {
  return {
    id: admin.firestore().collection('notifications').doc().id,
    isRead: false,
    date: admin.firestore.FieldValue.serverTimestamp(),
    app: App.delivery,
    ...notification
  };
}
