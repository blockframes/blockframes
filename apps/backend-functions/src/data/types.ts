import { PublicOrganization } from '@blockframes/organization/+state/organization.firestore';
import { NotificationType } from '@blockframes/notification/+state/notification.firestore';
import { PublicMovie } from '@blockframes/movie/+state/movie.firestore';

export { MovieDocument, PublicMovie } from '@blockframes/movie/+state/movie.firestore';
export { ContractDocument, PublicContractDocument, ContractVersionDocument } from '@blockframes/contract/contract/+state/contract.firestore';
export {
  OrganizationDocument,
  createOrganizationDocument,
  PublicOrganization
} from '@blockframes/organization/+state/organization.firestore';
export { OrganizationStatus } from '@blockframes/utils/static-model/types';
export {
  InvitationDocument,
  InvitationOrUndefined,
  InvitationStatus,
  InvitationType,
} from '@blockframes/invitation/+state/invitation.firestore';
export {
  PermissionsDocument,
  DocPermissionsDocument,
  createDocPermissions,
  UserRole
} from '@blockframes/permissions/+state/permissions.firestore';
export { PublicUser } from '@blockframes/user/+state/user.firestore';
export { RequestDemoInformations } from '@blockframes/utils/request-demo';
export { MovieAnalytics, MovieEventAnalytics, StoreConfig } from '@blockframes/movie/+state/movie.firestore';
export { NotificationOptions, NotificationType, NotificationDocument } from '@blockframes/notification/+state/notification.firestore';
export { EventsAnalytics, EventAnalytics, ScreeningEventDocument } from '@blockframes/event/+state/event.firestore';

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
