import { PublicOrganization } from '@blockframes/organization/types';
import { NotificationType } from '@blockframes/notification/types';
import { PublicMovie } from '@blockframes/movie/types';

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
  export { DeliveryDocument, StepDocument, StepDocumentWithDate, convertStepDocumentToStepDocumentWithDate } from '@blockframes/material/delivery/types';

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

export interface Movie {
  id: string;
  main: {
    title: {
      original: string;
      international: string;
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

export interface SnapObject {
  organization: PublicOrganization | undefined;
  movie: PublicMovie;
  docId: string;
  type: NotificationType;
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
