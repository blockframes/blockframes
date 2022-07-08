import { firestore } from './firestore';
import { EIGHT_MINUTES_IN_MS, metaDoc } from '@blockframes/utils/maintenance';

export const maintenance = {
  start() {
    const maintenanceStart = {
      endedAt: null,
      startedAt: Date.now(),
    };
    firestore.create([{ [metaDoc]: maintenanceStart }]);
  },

  end() {
    const maintenanceEnd = {
      endedAt: Date.now() - EIGHT_MINUTES_IN_MS,
      startedAt: null,
    };
    firestore.create([{ [metaDoc]: maintenanceEnd }]);
  },
};
