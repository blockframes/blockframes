import { PublicOrganization } from '@blockframes/organization/types';
import { NotificationType } from '@blockframes/notification/types';
import { PublicMovie } from '@blockframes/movie/types';

export { MovieDocument, PublicMovie } from '@blockframes/movie/types';
export {
  OrganizationDocument,
  OrganizationStatus,
  createOrganizationDocument,
  PublicOrganization
} from '@blockframes/organization/types';
export {
  InvitationDocument,
  InvitationOrUndefined,
  InvitationStatus,
  InvitationType,
  InvitationFromOrganizationToUser,
  InvitationFromUserToOrganization,
  InvitationToWorkOnDocument
} from '@blockframes/invitation/types';
export { MaterialDocument, MaterialStatus } from '@blockframes/material/material/types';
export { StakeholderDocument } from '@blockframes/material/delivery/stakeholder/types';
export {
  DeliveryDocument,
  StepDocument,
  StepDocumentWithDate,
  convertStepDocumentToStepDocumentWithDate
} from '@blockframes/material/delivery/types';
export {
  PermissionsDocument,
  AppPermissionsDocument,
  UserPermissionsDocument,
  DocPermissionsDocument,
  createAppPermissions,
  createDocPermissions,
  UserRole
} from '@blockframes/permissions/types';
export { PublicUser } from '@blockframes/auth/types';
export { RequestDemoInformations } from '@blockframes/catalog/demo-request.model';
export { MovieAnalytics, EventAnalytics } from '@blockframes/movie/movie/+state/movie.firestore';
export { createNotification, NotificationType, NotificationDocument } from '@blockframes/notification/types';
export { App } from '@blockframes/utils/apps';

/**
 * Types used by the firebase backend.
 *
 * Define all type to be used in the codebase. Please see the index.ts for more
 * details on why, what and what's up next.
 */

// Low Level Types
// ===============
export type IDMap<T> = Record<string, T>;

interface DocWithID {
  id: string;
}

// Core Application Types
// ======================
// Business & App Related

export enum AppAccessStatus {
  requested = 'requested',
  pending = 'pending',
  accepted = 'accepted'
}

/** Custom object used to build notifications. */
export interface SnapObject {
  organization: PublicOrganization;
  movie: PublicMovie;
  docId: string;
  type: NotificationType;
}

/** Custom object used to create an invitation. */
export interface RequestToJoinOrganization {
  adminEmail: string;
  adminName: string;
  organizationName: string;
  organizationId: string;
  userFirstname: string;
  userLastname: string;
}

/**
 * Turn a list of items with ids into the corresponding mapping.
 *
 * @param items A list of item with an ID
 * @returns an object that maps each id to its item,
 *          `{id_x: item_x, id_y: item_y, ...}`
 */
export function asIDMap<T extends DocWithID>(items: T[]): IDMap<T> {
  return items.reduce((result, item) => ({ ...result, [item.id]: item }), {});
}
