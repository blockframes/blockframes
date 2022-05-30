import { createStorageFile, StorageFile } from './media';
import type { DocumentMeta } from './meta';
import type { Genre, Language, Media, Territory } from './static';
import type { NotificationTypes } from './notification';
import type { UserRole } from './permissions';

export interface User extends PublicUser {
  financing: {
    rank: string;
  };
  firstName: string;
  lastName: string;
  phoneNumber: string;
  position: string;
  orgId: string;
  avatar: StorageFile;
  privacyPolicy: PrivacyPolicy;
  settings?: UserSettings;
  preferences?: Preferences;
}

export interface PrivacyPolicy {
  date: Date;
  ip: string;
}

interface UserSettings {
  notifications?: NotificationSettings;
}

export interface NotificationSettingsTemplate {
  email: boolean;
  app: boolean;
}

export type NotificationSettings = Partial<Record<NotificationTypes, NotificationSettingsTemplate>>;

/** A user interface with public information */
export interface PublicUser {
  _meta?: DocumentMeta<Date>;
  uid: string;
  email: string;
  avatar?: StorageFile;
  firstName?: string;
  lastName?: string;
  orgId?: string;
  hideEmail: boolean;
}

export interface Preferences {
  medias: Media[];
  territories: Territory[];
  languages: Language[];
  genres: Genre[];
}

export function createPublicUser(user: Partial<User> = {}): PublicUser {
  return {
    uid: user.uid ?? '',
    email: user.email ?? '',
    avatar: createStorageFile(user?.avatar),
    firstName: user.firstName ?? '',
    lastName: user.lastName ?? '',
    orgId: user.orgId ?? '',
    hideEmail: user.hideEmail ?? false,
  };
}

export interface OrganizationMember extends PublicUser {
  role?: UserRole; // Role of the user in his organization
}

/** A factory function that creates an OrganizationMember */
export function createOrganizationMember(user: Partial<User> = {}, role?: UserRole): OrganizationMember {
  return {
    ...createPublicUser(user),
    role,
  };
}

export function createPreferences(params: Partial<Preferences> = {}): Preferences {
  return {
    territories: [],
    medias: [],
    languages: [],
    genres: [],
    ...params,
  };
}

export function createUser(user: Partial<User> = {}) {
  return {
    ...user,
    avatar: createStorageFile(user.avatar),
  } as User;
}

/** Verify if the user exists and has a name and surname. */
export function hasDisplayName(user: User): boolean {
  return !!user && !!user.firstName && !!user.lastName;
}