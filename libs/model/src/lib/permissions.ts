export interface PermissionsDocument {
  id: string;
  roles: Roles;
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
export type UserRole = 'superAdmin' | 'admin' | 'member';

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
    roles: params.roles || {},
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

export interface Permissions extends PermissionsDocument {
  docPermissions?: DocPermissionsDocument[];
}