import { firestore } from './firestore';
import { EIGHT_MINUTES_IN_MS, metaDoc } from '@blockframes/utils/maintenance';

export const maintenance = {
  start() {
    const maintenanceStart = {
      endedAt: null,
      startedAt: Date.now(),
    };
    return firestore.create([{ [metaDoc]: maintenanceStart }]);
  },

  end() {
    // Required
    cy.wait(5000); 
    const maintenanceEnd = {
      endedAt: Date.now() - EIGHT_MINUTES_IN_MS,
      startedAt: null,
    };
    return firestore.create([{ [metaDoc]: maintenanceEnd }]);
  },
};
