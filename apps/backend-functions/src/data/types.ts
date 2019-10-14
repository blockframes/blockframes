import { DeliveryDocument } from '@blockframes/material/delivery/types';

export { DeliveryDocument, StepDocument, StepDocumentWithDate, convertStepDocumentToStepDocumentWithDate } from '@blockframes/material/delivery/types';
export { OrganizationDocument, OrganizationStatus } from '@blockframes/organization/types';
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
  export { StakeholderDocument } from '@blockframes/organization/stakeholder/types';

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

export enum DocType {
  movie = 'movie',
  delivery = 'delivery',
  material = 'material'
}

export interface DocInformations {
  id: string;
  type: DocType | null; // TODO: We don't want type to be null => ISSUE#884
}

// Core Application Types
// ======================
// Business & App Related

export interface Movie {
  id: string;
  main: {
    title: {
      original: string;
    };
  }
  deliveryIds: string[];
}

export interface OrganizationPermissions {
  superAdmins: string[];
}

export interface OrganizationDocPermissions {
  id: string;
  canCreate: boolean;
  canRead: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  owner: boolean;
}

export interface UserDocPermissions {
  id: string;
  admins: string[];
  canCreate: string[];
  canDelete: string[];
  canRead: string[];
  canUpdate: string[];
}

export enum AppAccessStatus {
  requested = 'requested',
  pending = 'pending',
  accepted = 'accepted'
}

// Internal Interaction Types
// ==========================

export const enum App {
  main = 'main',
  mediaDelivering = 'media_delivering',
  mediaFinanciers = 'media_financiers'
}

// Legacy for compat between Notifications & Invitations
// TODO(issue#684): use App everywhere and let the frontend / concrete
//  code deal with the app specifics (icons, message, etc).
export type AppIcon = App;

/** A user interface with public informations */
export interface PublicUser {
  uid: string;
  email: string;
  name: string;
  surname: string;
}

/** An organization interface with public informations */
export interface PublicOrganization {
  id: string;
  name: string;
}

// Notifications
// -------------

export interface BaseNotification {
  message: string;
  user?: PublicUser;
  userId: string;
  docInformations: DocInformations;
  organization?: PublicOrganization;
  path?: string;
}

export interface Notification extends BaseNotification {
  id: string;
  isRead: boolean;
  date: FirebaseFirestore.FieldValue;
  appIcon: App;
}

export interface SnapObject {
  movie: Movie;
  docInformations: DocInformations;
  organization: PublicOrganization;
  eventType: string;
  delivery?: DeliveryDocument | null;
  count?: number;
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
