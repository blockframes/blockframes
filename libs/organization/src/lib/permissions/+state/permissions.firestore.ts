import { App } from "@blockframes/utils/apps";

export interface PermissionsDocument {
  id: string;
  roles: Roles
  canCreate: string[];
  canRead: string[];
  canUpdate: string[];
  canDelete: string[];
}

/** Mapping of all users with their role in the organization. */
export interface Roles {
  [memberId: string]: UserRole;
}

/** Roles a user can have in an organization. */
export const enum UserRole {
  superAdmin = 'superAdmin',
  admin = 'admin',
  member = 'member'
}

/** Permissions related to a specific application. */
export interface AppPermissionsDocument {
  name: App;
  admins: string[];
  canCreate: string[];
  canRead: string[];
  canUpdate: string[];
  canDelete: string[];
}

/** Permissions related to a specific user on a document. */
export interface UserPermissionsDocument {
  id: string;
  admins: string[];
  canCreate: string[];
  canRead: string[];
  canUpdate: string[];
  canDelete: string[];
}

/** Permissions related to an organization on a document. */
export interface DocPermissionsDocument {
  id: string;
  ownerId: string;
  isAdmin: boolean;
  canCreate: boolean;
  canRead: boolean;
  canUpdate: boolean;
  canDelete: boolean;
}

/** Factory function to create organization related permissions. */
export function createPermissions(params: Partial<PermissionsDocument>): PermissionsDocument {
  return {
    id: params.id || '',
    roles : params.roles || {},
    canCreate: [],
    canRead: [],
    canUpdate: [],
    canDelete: [],
    ...params
  };
}

/** Factory function to create application related permissions. */
export function createAppPermissions(app: App): AppPermissionsDocument {
  return {
    name: app,
    admins: [],
    canCreate: [],
    canRead: [],
    canUpdate: [],
    canDelete: []
  };
}

/** Factory function to create user permissions on a document. */
export function createUserPermissions(params: Partial<UserPermissionsDocument>): UserPermissionsDocument {
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

/** Factory function to create organization permissions on a document. */
export function createDocPermissions(params: Partial<DocPermissionsDocument> = {}): DocPermissionsDocument {
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
