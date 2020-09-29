import TunnelContractSummaryPage from "./TunnelContractSummaryPage";
import { TO } from "@blockframes/e2e/utils/env";

export default class TunnelContractPage {
  constructor() {
    cy.get('contract-details-sale', {timeout: TO.PAGE_LOAD});
  }

  // Party Name

  public fillFirstPartyName(partialName: string) {
    cy.get('contract-details-sale contract-form-party input', {timeout: TO.PAGE_ELEMENT})
      .first().type(partialName);
  }

  public selectFirstPartyName(name: string) {
    cy.get('mat-option', {timeout: TO.PAGE_ELEMENT})
      .contains(name).first().click();
  }

  public assertFirstPartyNameExists(name: string) {
    cy.get('contract-details-sale contract-form-party input', {timeout: TO.PAGE_ELEMENT})
      .first().should('have.value', name);
  }

  public selectFirstRole(role: string) {
    cy.get('contract-details-sale contract-form-party mat-select', {timeout: TO.PAGE_ELEMENT})
      .first().click();
    cy.get('mat-option', {timeout: TO.PAGE_ELEMENT})
      .contains(role).click();
  }

  public assertFirstRoleIsSelected(role: string) {
    cy.get('contract-details-sale contract-form-party mat-select', {timeout: TO.PAGE_ELEMENT})
      .first().contains(role);
  }

  public fillLastPartyName(partialName: string) {
    cy.get('contract-details-sale contract-form-party input', {timeout: TO.PAGE_ELEMENT})
      .last().type(partialName);
  }

  public selectLastPartyName(name: string) {
    cy.get('mat-option', {timeout: TO.PAGE_ELEMENT})
      .contains(name).last().click();
  }

  public assertLastPartyNameExists(name: string) {
    cy.get('contract-details-sale contract-form-party input', {timeout: TO.PAGE_ELEMENT})
      .last().should('have.value', name);
  }

  public selectLastRole(role: string) {
    cy.get('contract-details-sale contract-form-party mat-select', {timeout: TO.PAGE_ELEMENT})
      .last().click();
    cy.get('mat-option', {timeout: TO.PAGE_ELEMENT})
      .contains(role).click();
  }

  public assertLastRoleIsSelected(role: string) {
    cy.get('contract-details-sale contract-form-party mat-select', {timeout: TO.PAGE_ELEMENT})
      .last().contains(role);
  }

  // Terms distribution-form-terms

  public selectEvent(event: string) {
    cy.get('contract-details-sale distribution-form-terms mat-select[test-id=event]', 
      {timeout: TO.PAGE_ELEMENT}).click();
    cy.get('mat-option', {timeout: TO.PAGE_ELEMENT})
      .contains(event).click();
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

  // Save
  public clickSave() {
    cy.get('[test-id=save]', {timeout: TO.PAGE_ELEMENT})
      .click();
    cy.wait(TO.ONE_SEC);
  }

  public clickNext() {
    cy.get('[test-id=next]', {timeout: TO.PAGE_ELEMENT})
      .click();
    cy.wait(TO.THREE_SEC);
    return new TunnelContractSummaryPage();
  }
}
