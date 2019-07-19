/**
 * Types used by the firebase backend.
 *
 * Define all type to be used in the codebase. Please see the index.ts for more
 * details on why, what and what's up next.
 */

export type IDMap<T> = Record<string, T>;

interface DocWithID {
  id: string;
}

export interface DocInformations {
  id: string;
  type: 'movie' | 'delivery' | 'material';
}

export interface Organization {
  id: string;
  userIds: string[];
  movieIds: string[];
  name: string;
  address: string;
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

export interface BaseNotification {
  message: string;
  userId: string;
  docInformations: DocInformations;
  stakeholderId?: string;
  path?: string;
}

export interface Notification extends BaseNotification {
  id: string;
  isRead: boolean;
  date: FirebaseFirestore.FieldValue;
  appIcon: AppIcon;
}

export interface BaseInvitation {
  message: string;
  userInformations?: {
    userId: string;
    name?: string;
    surname?: string;
    email: string
  };
  docInformations: DocInformations;
  stakeholderId: string;
  path?: string;
}

export interface Invitation extends BaseInvitation {
  id: string;
  state: 'accepted' | 'declined' | 'pending';
  date: FirebaseFirestore.FieldValue;
  appIcon: AppIcon;
  processedId?: string;
}

export enum AppIcon {
  mediaDelivering = 'media_delivering',
  mediaFinanciers = 'media_financiers',
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
