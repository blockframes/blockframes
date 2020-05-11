import { DocPermissionsDocument, PermissionsDocument } from "./permissions.firestore";

export { createPermissions, UserRole } from '../../permissions/+state/permissions.firestore';

export interface Permissions extends PermissionsDocument {
  docPermissions?: DocPermissions[];
}

export type DocPermissions = DocPermissionsDocument;
