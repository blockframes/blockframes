import { firestore } from './firestore';
import { META_COLLECTION_NAME, MAINTENANCE_DOCUMENT_NAME, EIGHT_MINUTES_IN_MS } from '@blockframes/utils/maintenance';
import { Timestamp } from 'firebase/firestore';

const maintenancePath = `${META_COLLECTION_NAME}/${MAINTENANCE_DOCUMENT_NAME}`;

export const maintenance = {
  start() {
    const maintenanceStart = {
      endedAt: null,
      startedAt: JSON.stringify(Timestamp.now()),
    };
    firestore.create([{ [maintenancePath]: maintenanceStart }]);
  },

  end() {
    const maintenanceEnd = {
      endedAt: JSON.stringify(Timestamp.fromMillis(Date.now() - EIGHT_MINUTES_IN_MS)),
      startedAt: null,
    };
    firestore.create([{ [maintenancePath]: maintenanceEnd }]);
  },
};
