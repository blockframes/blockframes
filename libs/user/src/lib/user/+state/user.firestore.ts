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
  settings: UserSettings
}

export interface UserSettings {
  notifications: Record<NotificationType | InvitationType | 'default', { email: boolean, app: boolean }>
}

export function createUserSettings(settings: Partial<UserSettings> = {}): UserSettings {
  return {
    notifications: {
      default: {
        email: false,
        app: true,
      },
      // @TODO #4046 add default (existing) settings for invitationType and notificationType
      ...settings.notifications
    },
    ...settings
  }
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
