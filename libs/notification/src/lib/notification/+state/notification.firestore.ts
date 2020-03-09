import { PublicOrganization } from '@blockframes/organization/types';
import { PublicMovie } from '@blockframes/movie/types';
import { App } from '@blockframes/utils/apps';
import { PublicUser } from '@blockframes/auth/+state/auth.firestore';
import { firestore } from 'firebase-admin';

/** Type of Notification depending of its origin. */
export type NotificationType =
  'newSignature' |
  'finalSignature' |
  'createDocument' |
  'deleteDocument' |
  'updateDocument' |
  'inviteOrganization' |
  'removeOrganization' |
  'pathToDocument' |
  'organizationAcceptedByArchipelContent' |
  'movieSubmitted' |
  'movieAccepted' |
  'movieTitleUpdated' |
  'movieTitleCreated' |
  'movieDeleted' |
  'invitationFromUserToJoinOrgDecline' |
  'invitationFromOrganizationToUserDecline' |
  'memberAddedToOrg' |
  'memberRemovedFromOrg' |
  'newContract' |
  'contractInNegotiation'
;

/** Minimum required informations to create a Notification. */
export interface NotificationOptions {
  userId: string;
  user?: Partial<PublicUser>;
  docId?: string;
  type: NotificationType;
  movie?: PublicMovie;
  organization?: PublicOrganization;
  app: App;
}

/** Generic informations for a Notification. */
export interface NotificationDocument extends NotificationOptions {
  id: string;
  isRead: boolean;
  date: firestore.Timestamp;
};
