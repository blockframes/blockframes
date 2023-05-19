import { IMaintenanceDoc } from '@blockframes/model';

/** Delay before considering the maintenance over */
export const EIGHT_MINUTES_IN_MS = 8 * 60 * 1000; // 8 minutes in ms
export const META_COLLECTION_NAME = '_META';
export const MAINTENANCE_DOCUMENT_NAME = '_MAINTENANCE';
export const DB_DOCUMENT_NAME = '_VERSION';
export const APP_DOCUMENT_NAME = '_APP';
export const ALGOLIA_ANONYMOUS_SEARCH_KEY = '_ALGOLIA_ANONYMOUS_SEARCH_KEY';
export const ALGOLIA_SEARCH_KEY = '_ALGOLIA_SEARCH_KEY';
export type AlgoliaSearchKey = typeof ALGOLIA_SEARCH_KEY | typeof ALGOLIA_ANONYMOUS_SEARCH_KEY;

export const metaDoc = `${META_COLLECTION_NAME}/${MAINTENANCE_DOCUMENT_NAME}`;
export const dbVersionDoc = `${META_COLLECTION_NAME}/${DB_DOCUMENT_NAME}`;
export const appVersionDoc = `${META_COLLECTION_NAME}/${APP_DOCUMENT_NAME}`;
export const algoliaSearchKeyDoc = `${META_COLLECTION_NAME}/${ALGOLIA_SEARCH_KEY}`;
export const algoliaAnonymousSearchKeyDoc = `${META_COLLECTION_NAME}/${ALGOLIA_ANONYMOUS_SEARCH_KEY}`;

export function _isInMaintenance(maintenanceDoc: IMaintenanceDoc, delay = EIGHT_MINUTES_IN_MS): boolean {
  try {
    if (!maintenanceDoc) {
      console.error(`Error while checking if app is in maintenance : missing maintenance doc`);
      return true;
    }

    if (maintenanceDoc.startedAt) {
      return true;
    }

    if (maintenanceDoc.endedAt) {
      // Wait `delay` minutes before allowing any operation on the db.
      // this prevents triggering firebase events.
      // NOTE: this is hack-ish but good enough for our needs! we'll revisit this later.
      const now = Date.now();
      return maintenanceDoc.endedAt.getTime() + delay > now;
    }

    // We shouldn't throw here else if this happen it create cache issues
    console.error(`Unexpected cases for maintenance check! please check the ${metaDoc} document.`);

    return true;
  } catch (e) {
    console.error(`Error while checking if app is in maintenance : ${e.message}`);
    return true;
  }
}
