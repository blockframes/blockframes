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
    /**
     * This wait is required for backend function triggers 
     * that can take a certain amount of time before warming up:
     * Even if db writes are ended, triggers will be executed a certain amount of time after,
     * possibly after maintenance.end().
     * 
     * 5000 was set arbitrary, can maybe be lowered.
     */
    cy.wait(5000);
    const maintenanceEnd = {
      endedAt: Date.now() - EIGHT_MINUTES_IN_MS,
      startedAt: null,
    };
    return firestore.create([{ [metaDoc]: maintenanceEnd }]);
  },
};
