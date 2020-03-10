import TunnelContractSummaryPage from "./TunnelContractSummaryPage";

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

  // Terms distribution-form-terms

  public selectEvent(event: string) {
    cy.get('contract-details-sale distribution-form-terms mat-select[test-id=event]').click();
    cy.get('mat-option').contains(event).click();
  }

  public assertEventIsSelected(event: string) {
    cy.get('contract-details-sale distribution-form-terms mat-select[test-id=event]').contains(event);
  }

  public fillDuration(duration: string) {
    cy.get('contract-details-sale distribution-form-terms input[test-id=duration]').type(duration);
  }

  public assertDurationExists(duration: string) {
    cy.get('contract-details-sale distribution-form-terms input[test-id=duration]').should('have.value', duration);
  }

  public selectPeriod(period: string) {
    cy.get('contract-details-sale distribution-form-terms mat-select[test-id=period]').click();
    cy.get('mat-option').contains(period).click();
  }

  public assertPeriodIsSelected(period: string) {
    cy.get('contract-details-sale distribution-form-terms mat-select[test-id=period]').contains(period);
  }

  // Title Selection & Price

  public selectCurrency(currency: string) {
    cy.get('contract-details-sale contract-version-form-price mat-select').click();
    cy.get('mat-option').contains(currency).click({ force: true });
  }

  public assertCurrencyIsSelected(currency: string) {
    cy.get('contract-details-sale contract-version-form-price mat-select').contains(currency);
  }

  public fillSearchSelection(name: string) {
    cy.get('contract-details-sale contract-version-form-price algolia-autocomplete input').type(name);
  }

  public selectSearchSelection(name: string) {
    cy.get('mat-option').contains(name).click({ force: true });
  }

  public assertMovieIsSelected(name: string) {
    cy.get('movie-banner').contains(name);
  }

  public fillPackagePrice(price: string) {
    cy.get('contract-details-sale contract-version-form-price input[test-id=price]').clear().type(price);
  }

  public assertPackagePriceExists(price: string) {
    cy.get('contract-details-sale contract-version-form-price input[test-id=price]').should('have.value', price);
  }

  // Payment Schedules

  public selectPaymentsUponEvent() {
    cy.get('contract-details-sale contract-version-form-schedule mat-radio-button').first().click();
  }

  public fillPercentagePaymentUponEvent(percentage: string) {
    cy.get('contract-details-sale contract-version-form-schedule input[test-id=percentage]').type(percentage);
  }

  public assertPercentagePaymentUponEventExists(percentage: string) {
    cy.get('contract-details-sale contract-version-form-schedule input[test-id=percentage]').should('have.value', percentage);
  }

  public selectTriggeringEvent(event: string) {
    cy.get('contract-details-sale contract-version-form-schedule mat-select[test-id=triggering-event]').click();
    cy.get('mat-option').contains(event).click();
  }

  public assertTriggeringEventIsSelected(event: string) {
    cy.get('contract-details-sale contract-version-form-schedule mat-select[test-id=triggering-event]').contains(event);
  }

  public fillPaymentTermDuration(duration: string) {
    cy.get('contract-details-sale contract-version-form-schedule input[test-id=duration]').type(duration);
  }

  public assertPaymentTermDurationExists(duration: string) {
    cy.get('contract-details-sale contract-version-form-schedule input[test-id=duration]').should('have.value', duration);
  }

  public selectPaymentDurationPeriod(period: string) {
    cy.get('contract-details-sale contract-version-form-schedule mat-select[test-id=period]').click();
    cy.get('mat-option').contains(period).click();
  }

  public assertPaymentDurationPeriodIsSelected(period: string) {
    cy.get('contract-details-sale contract-version-form-schedule mat-select[test-id=period]').contains(period);
  }

  public selectPaymentTermEvent(event: string) {
    cy.get('contract-details-sale contract-version-form-schedule mat-select[test-id=every-event]').click();
    cy.get('mat-option').contains(event).click();
  }

  public assertPaymentTermEventIsSelected(event: string) {
    cy.get('contract-details-sale contract-version-form-schedule mat-select[test-id=every-event]').contains(event);
  }

  public clickNext() {
    cy.get('[test-id=next]').click();
    return new TunnelContractSummaryPage();
  }
}
