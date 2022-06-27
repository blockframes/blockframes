import { firestore } from './firestore';
import { META_COLLECTION_NAME, MAINTENANCE_DOCUMENT_NAME, EIGHT_MINUTES_IN_MS } from '@blockframes/utils/maintenance';

const maintenancePath = `${META_COLLECTION_NAME}/${MAINTENANCE_DOCUMENT_NAME}`;

export const maintenance = {
  start() {
    const maintenanceStart = {
      endedAt: null,
      startedAt: Date.now(),
    };
    firestore.create([{ [maintenancePath]: maintenanceStart }]);
  },

  end() {
    const maintenanceEnd = {
      endedAt: Date.now() - EIGHT_MINUTES_IN_MS,
      startedAt: null,
    };
    firestore.create([{ [maintenancePath]: maintenanceEnd }]);
  },
};
