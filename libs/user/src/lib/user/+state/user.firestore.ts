import { DocumentMeta } from "@blockframes/utils/models-meta";
import { NotificationType } from '@blockframes/notification/types';
import { InvitationType } from "@blockframes/invitation/+state/invitation.firestore";
export interface User extends PublicUser {
  financing: {
    rank: string
  };
  firstName: string;
  lastName: string;
  phoneNumber: string;
  position: string;
  orgId: string;
  avatar: string;
  watermark: string;
  privacyPolicy: {
    date: Date;
    ip: string;
  },
  notificationsSettings: UserNotificationsSettings
}

export interface UserNotificationsSettings {
  email: boolean,
  app: boolean,
  custom?: Record<NotificationType | InvitationType, { email: boolean, app: boolean }>
}

/** A user interface with public information */
export interface PublicUser {
  _meta?: DocumentMeta<Date>;
  uid: string;
  email: string;
  avatar?: string;
  watermark?: string;
  firstName?: string;
  lastName?: string;
  orgId?: string;
}

export function createPublicUser(user: Partial<User> = {}): PublicUser {
  return {
    uid: user.uid ?? '',
    email: user.email ?? '',
    avatar: user.avatar ?? '',
    watermark: user.watermark ?? '',
    firstName: user.firstName ?? '',
    lastName: user.lastName ?? '',
    orgId: user.orgId ?? ''
  }
}
