import { App } from "@blockframes/utils/apps";

export interface PermissionsDocument {
  orgId: string;
  superAdmins: string[];
  admins: string[];
  members: string[];
  roles: Roles
  canCreate: string[];
  canRead: string[];
  canUpdate: string[];
  canDelete: string[];
  userAppPermissions?: AppPermissions[];
  userDocPermissions?: UserDocPermissions[];
  organizationDocPermissions?: OrganizationDocPermissions[];
}

export interface Roles {
  [memberId: string]: UserRole;
}

export const enum UserRole {
  superAdmin = 'superAdmin',
  admin = 'admin',
  member = 'member'
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

export interface OrganizationDocPermissions {
  id: string;
  ownerId: string;
  isAdmin: boolean;
  canCreate: boolean;
  canRead: boolean;
  canUpdate: boolean;
  canDelete: boolean;
}

export function createOrgPermissions(params: Partial<PermissionsDocument>): PermissionsDocument {
  return {
    orgId: params.orgId || '',
    superAdmins: params.superAdmins || [],
    admins: [],
    members: [],
    roles : params.roles || {},
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

export function createUserDocPermissions(params: Partial<UserDocPermissions>): UserDocPermissions {
  return {
    id: params.id || '',
    admins: [],
    canCreate: [],
    canRead: [],
    canUpdate: [],
    canDelete: [],
    ...params
  };
}


export function createOrganizationDocPermissions(params: Partial<OrganizationDocPermissions>): OrganizationDocPermissions {
  return {
    id: params.id || '',
    ownerId: params.ownerId || '',
    isAdmin: true,
    canCreate: true,
    canRead: true,
    canUpdate: true,
    canDelete: true,
    ...params
  };
}
