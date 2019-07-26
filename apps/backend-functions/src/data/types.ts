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
  type: DocType;
}

// Core Application Types
// ======================
// Business & App Related

export const enum OrganizationStatus {
  pending = 'pending',
  accepted = 'accepted'
}

export interface Organization {
  id: string;
  userIds: string[];
  movieIds: string[];
  name: string;
  address: string;
  status: OrganizationStatus;
}

export interface Stakeholder {
  id: string;
  isAccepted: boolean;
  processedId: string;
}

export interface Step {
  id: string;
  date: Date;
  name: string;
}

export interface Delivery {
  id: string;
  movieId: string;
  processedId: string;
  stakeholders: string[];
  materials: string[];
  steps: Step[];
}

export interface Movie {
  id: string;
  title: {
    original: string;
  };
  deliveryIds: string[];
}

export interface Material {
  id: string;
  value: string;
  description: string;
  category: string;
  deliveriesIds: string[];
  state: string;
  stepId: string;
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
  requests = 'requested',
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

// Invitations
// -----------

export const enum InvitationState {
  accepted = 'accepted',
  declined = 'declined',
  pending = 'pending'
}

export const enum InvitationType {
  stakeholder = 'stakeholder',
  toOrganization = 'toOrganization'
}

/**
 * Raw invitation with generic fields,
 * use type dispatch to identify the actual content of the invitation.
 */
interface RawInvitation {
  id: string;
  app: App;
  state: InvitationState;
  type: InvitationType;
  date: FirebaseFirestore.FieldValue;
  processedId?: string;
}

/** Invite a stakeholder to work on a document. */
export interface InvitationStakeholder extends RawInvitation {
  type: InvitationType.stakeholder;
  docId: string;
  docType: DocType;
  organizationId: string;
}

/** Invite a user to an organization. */
export interface InvitationToOrganization extends RawInvitation {
  type: InvitationType.toOrganization;
  userId: string;
  organizationId: string;
}

/**
 * This is the generic type for invitation,
 * use the type field to figure out which kind of invitation you are working with.
 */
export type Invitation = InvitationStakeholder | InvitationToOrganization;
export type InvitationOrUndefined = Invitation | undefined;

// Notifications
// -------------

export interface BaseNotification {
  message: string;
  userInformations?: {
    userId: string;
    name?: string;
    surname?: string;
    email: string;
  };
  userId: string;
  docInformations: DocInformations;
  organizationId?: string;
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
  organization: Organization;
  eventType: string;
  delivery?: Delivery | null;
  newStakeholderId: string;
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
