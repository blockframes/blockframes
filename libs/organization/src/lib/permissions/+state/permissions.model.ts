export interface Permissions {
  orgId: string;
  superAdmins: string[];
  admins: string[];
  canCreate: string[];
  canRead: string[];
  canUpdate: string[];
  canDelete: string[];
  userAppsPermissions?: AppPermissions[];
  userDocsPermissions?: UserDocPermissions[];
  orgDocsPermissions?: OrgDocPermissions[];
}

export interface AppPermissions {
  id: string;
  name: App;
  admins: string[];
  canCreate: string[];
  canRead: string[];
  canUpdate: string[];
  canDelete: string[];
}

export interface UserDocPermissions {
  id: string,
  admins: string[];
  canCreate: string[];
  canRead: string[];
  canUpdate: string[];
  canDelete: string[];
}

export interface OrgDocPermissions {
  id: string,
  owner: string,
  isAdmin: boolean,
  canCreate: boolean,
  canRead: boolean,
  canUpdate: boolean,
  canDelete: boolean
}

export enum App  {
  mediaDelivering = 'MediaDelivering',
  mediaFinanciers = 'MediaFinanciers',
  storiesAndMore = 'StoriesAndMore'
}

export function createPermissions(params: Partial<Permissions> = {}) {
  return {
    superAdmins: [params.superAdmins],
    canCreate: [],
    canRead: [],
    canUpdate: [],
    canDelete: [],
    ...params
  } as Permissions;
}

export function createAppPermissions(app: App) {
  return {
      name: app,
      admins: [],
      canCreate: [],
      canRead: [],
      canUpdate: [],
      canDelete: [],
    } as AppPermissions;
}

export function createUserDocPermissions(docId: string) {
  return {
    id: docId,
    admins: [],
    canCreate: [],
    canRead: [],
    canUpdate: [],
    canDelete: []
  } as UserDocPermissions;
}

export function createOrgDocPermissions(docId: string, orgId:string) {
  return {
    id: docId,
    owner: orgId,
    isAdmin: true,
    canCreate: true,
    canRead: true,
    canUpdate: true,
    canDelete: true
  } as OrgDocPermissions;
}
