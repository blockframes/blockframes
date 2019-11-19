export interface Permissions {
  orgId: string;
  superAdmins: string[];
  admins: string[];
  members: string[];
  canCreate: string[];
  canRead: string[];
  canUpdate: string[];
  canDelete: string[];
  userAppsPermissions?: AppPermissions[];
  userDocsPermissions?: UserDocPermissions[];
  orgDocsPermissions?: OrgDocPermissions[];
}

export interface AppPermissions {
  name: App;
  admins: string[];
  canCreate: string[];
  canRead: string[];
  canUpdate: string[];
  canDelete: string[];
}

export interface UserDocPermissions {
  id: string;
  admins: string[];
  canCreate: string[];
  canRead: string[];
  canUpdate: string[];
  canDelete: string[];
}

export interface OrgDocPermissions {
  id: string;
  owner: string;
  isAdmin: boolean;
  canCreate: boolean;
  canRead: boolean;
  canUpdate: boolean;
  canDelete: boolean;
}

// TODO(#714): Synchronize data types with the frontend
// Do not change these values without upgrading the backend too!
// You'll find relevant spots by searching for the issue number.
export const enum App {
  mediaDelivering = 'delivery',
  mediaFinanciers = 'movie-financing',
  storiesAndMore = 'stories-and-more',
  biggerBoat = 'catalog'
}

export function createPermissions(params: Partial<Permissions> = {}): Permissions {
  return {
    orgId: params.orgId,
    superAdmins: params.superAdmins,
    admins: [],
    members: [],
    canCreate: [],
    canRead: [],
    canUpdate: [],
    canDelete: [],
    ...params
  };
}

export function createAppPermissions(app: App): AppPermissions {
  return {
    name: app,
    admins: [],
    canCreate: [],
    canRead: [],
    canUpdate: [],
    canDelete: []
  };
}

export function createUserDocPermissions(docId: string): UserDocPermissions {
  return {
    id: docId,
    admins: [],
    canCreate: [],
    canRead: [],
    canUpdate: [],
    canDelete: []
  };
}

export function createOrgDocPermissions(docId: string, orgId: string): OrgDocPermissions {
  return {
    id: docId,
    owner: orgId,
    isAdmin: true,
    canCreate: true,
    canRead: true,
    canUpdate: true,
    canDelete: true
  };
}
