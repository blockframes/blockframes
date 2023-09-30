import { createStorageFile, StorageFile } from './media';
import type { DocumentMeta } from './meta';
import { appName, App, Genre, Language, Media, Territory } from './static';
import type { NotificationTypes } from './notification';
import type { UserRole } from './permissions';
import { Organization } from './organisation';
import { Permissions } from './permissions';

export interface User extends PublicUser {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  position: string;
  orgId: string;
  avatar: StorageFile;
  privacyPolicy: LegalTerms;
  termsAndConditions?: Partial<Record<App, LegalTerms>>;
  settings?: UserSettings;
  preferences?: Preferences;
  savedSearches?: Partial<Record<App, string>>
}

export interface CrmUser extends User {
  firstConnection: Date;
  lastConnection: Date;
  pageView: number;
  sessionCount: number;
  createdFrom: string;
  org: Organization;
}

export interface LegalTerms {
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
  _meta?: DocumentMeta;
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
export function hasDisplayName(user: User | PublicUser): boolean {
  return !!user && !!user.firstName && !!user.lastName;
}

function randomNumber() {
  return Math.floor(Math.random() * 255);
}

function fakeIp() {
  return randomNumber() + 1 + '.' + randomNumber() + '.' + randomNumber() + '.' + randomNumber();
}

export const fakeLegalTerms = { date: new Date(), ip: fakeIp() };

export const getMemberRole = (r: CrmUser, permissions: Permissions[]) => {
  const permission = permissions.find(p => p.id === r.orgId);
  if (!permission) return;
  return permission.roles[r.uid];
};

export function usersToCrmUsers(users: User[], orgs: Organization[], userAnalytics: any[]) {
  const crmUsers: CrmUser[] = users.map(u => {
    const userMetaAnalytics = userAnalytics.find(analytic => analytic.user_id === u.uid);
    const org = orgs.find(o => o.id === u.orgId);
    const CRMuser = {
      ...u,
      firstConnection: userMetaAnalytics && new Date(userMetaAnalytics['first_connexion'].value),
      lastConnection: userMetaAnalytics && new Date(userMetaAnalytics['last_connexion'].value),
      pageView: userMetaAnalytics && userMetaAnalytics['page_view'],
      sessionCount: userMetaAnalytics && userMetaAnalytics['session_count'],
      createdFrom: u._meta?.createdFrom ? appName[u._meta?.createdFrom] : '',
      org,
    };
    return CRMuser;
  });
  return crmUsers;
}