import { PermissionsDocument, AppPermissionsDocument, UserPermissionsDocument, DocPermissionsDocument } from "./permissions.firestore";

export { createPermissions, UserRole, createAppPermissions } from '../../permissions/+state/permissions.firestore';

export interface Permissions extends PermissionsDocument {
  appPermissions?: AppPermissions[];
  userPermissions?: UserPermissions[];
  docPermissions?: DocPermissions[];
}

export type AppPermissions = AppPermissionsDocument;

export type UserPermissions = UserPermissionsDocument;

export type DocPermissions = DocPermissionsDocument;
