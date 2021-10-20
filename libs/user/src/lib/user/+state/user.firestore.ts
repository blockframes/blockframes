import { DocumentMeta } from "@blockframes/utils/models-meta";
import { NotificationTypesBase } from '@blockframes/notification/types';
import { createStorageFile, StorageFile } from "@blockframes/media/+state/media.firestore";

export interface User extends PublicUser {
  financing: {
    rank: string
  };
  firstName: string;
  lastName: string;
  phoneNumber: string;
  position: string;
  orgId: string;
  avatar: StorageFile;
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

export type NotificationSettings = Record<NotificationTypesBase, NotificationSettingsTemplate>;

/** A user interface with public information */
export interface PublicUser {
  _meta?: DocumentMeta<Date | FirebaseFirestore.Timestamp>;
  uid: string;
  email: string;
  avatar?: StorageFile;
  firstName?: string;
  lastName?: string;
  orgId?: string;
}

export function createPublicUser(user: Partial<User> = {}): PublicUser {
  return {
    uid: user.uid ?? '',
    email: user.email ?? '',
    avatar: createStorageFile(user?.avatar),
    firstName: user.firstName ?? '',
    lastName: user.lastName ?? '',
    orgId: user.orgId ?? ''
  }
}
