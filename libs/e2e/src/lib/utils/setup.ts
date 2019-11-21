
export function setupForIpad() {
  cy.clearCookies();
  cy.clearLocalStorage();
  cy.viewport('ipad-2', 'landscape');
  cy.visit('/auth');
}

export function setupForMacbook() {
  cy.clearCookies();
  cy.clearLocalStorage();
  cy.viewport('macbook-15');
  cy.visit('/auth');
}
