import { DocumentMeta } from "@blockframes/utils/models-meta";
import { NotificationType } from '@blockframes/notification/types';

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
  privacyPolicy: PrivacyPolicy;
  settings?: UserSettings
}

export interface PrivacyPolicy {
  date: Date;
  ip: string;
}

export interface UserSettings {
  notifications?: NotificationSettings,
}

export interface NotificationSettingsTemplate { email: boolean, app: boolean };

export type NotificationSettings = Record<NotificationType, NotificationSettingsTemplate>;

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
