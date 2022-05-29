export const maintenance = {
  start() {
    return cy.task('startEmulatorMaintenance');
  },

  end() {
    return cy.task('endEmulatorMaintenance');
  },
};
