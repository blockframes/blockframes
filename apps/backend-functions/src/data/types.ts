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

export interface DocID {
  id: string;
  type: 'movie' | 'delivery' | 'material';
}

export interface Organization {
  id: string;
  userIds: string[];
  name: string;
  address: string;
}

export interface Stakeholder {
  id: string;
  orgId: string;
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
  docID: DocID;
  stakeholderId?: string;
  path?: string;
}

export interface Notification extends BaseNotification {
  id: string;
  isRead: boolean;
  date: any;
  app: string;
}

export interface SnapObject {
  movie: Movie;
  docID: DocID;
  org: Organization;
  eventType: string;
  delivery?: Delivery | null;
  newStakeholderId?: string;
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
