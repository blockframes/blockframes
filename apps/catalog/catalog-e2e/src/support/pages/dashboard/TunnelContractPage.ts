export default class TunnelContractPage {
  constructor() {
    cy.get('contract-details-sale');
  }

  // Party Name

  public fillFirstPartyName(name: string) {
    cy.get('contract-details-sale contract-form-party input').first().type(name);
  }

  public assertFirstPartyNameExists(name: string) {
    cy.get('contract-details-sale contract-form-party input').first().should('have.value', name);
  }

  public selectFirstRole(role: string) {
    cy.get('contract-details-sale contract-form-party mat-select').first().click();
    cy.get('mat-option').contains(role).click();
  }

  public assertFirstRoleIsSelected(role: string) {
    cy.get('contract-details-sale contract-form-party mat-select').first().contains(role);
  }

  public fillLastPartyName(name: string) {
    cy.get('contract-details-sale contract-form-party input').last().type(name);
  }

  public assertLastPartyNameExists(name: string) {
    cy.get('contract-details-sale contract-form-party input').last().should('have.value', name);
  }

  public selectLastRole(role: string) {
    cy.get('contract-details-sale contract-form-party mat-select').last().click();
    cy.get('mat-option').contains(role).click();
  }

  public assertLastRoleIsSelected(role: string) {
    cy.get('contract-details-sale contract-form-party mat-select').last().contains(role);
  }
}
