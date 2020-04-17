import { DocPermissionsDocument, PermissionsDocument } from "./permissions.firestore";

export { createPermissions, UserRole } from '../../permissions/+state/permissions.firestore';

export interface Permissions extends PermissionsDocument {
  /** @TODO (#2539) This is currently unused but we keep it to future uses. */
  //appPermissions?: AppPermissions[];
  //userPermissions?: UserPermissions[];
  docPermissions?: DocPermissions[];
}

/** @TODO (#2539) This is currently unused but we keep it to future uses. */
// export type AppPermissions = AppPermissionsDocument;

/** @TODO (#2539) This is currently unused but we keep it to future uses. */
//export type UserPermissions = UserPermissionsDocument;

export type DocPermissions = DocPermissionsDocument;
