import TitlesDetailsPage from "./TitlesDetailsPage";

export default class TunnelSummaryPage {
  constructor() {
    cy.get('catalog-summary-tunnel', { timeout: 30000 });
  }

  public clickSubmit() {
    cy.get('catalog-summary-tunnel button[test-id=submit]').click();
    return new TitlesDetailsPage();
  }

  public clickSave() {
    cy.get('catalog-movie-tunnel button[test-id=movie-save]').click();
    cy.wait(1000);
  }

  public assertMainFields(fields: string[]) {
    fields.forEach(field => {
      cy.get('catalog-summary-tunnel movie-summary-main').contains(field);
    });
  }

  public assertCountriesOfOriginFields(fields: string[]) {
    fields.forEach(field => {
      cy.get('catalog-summary-tunnel movie-summary-country').contains(field);
    });
  }

  public assertMainInformation(fields: string[]) {
    fields.forEach(field => {
      cy.get('catalog-summary-tunnel movie-summary-information').contains(field);
    });
  }

  public assertSalesCast(fields: string[]) {
    fields.forEach(field => {
      cy.get('catalog-summary-tunnel movie-summary-sales-cast').contains(field);
    });
  }

  public assertFestivalPrizes(fields: string[]) {
    fields.forEach(field => {
      cy.get('catalog-summary-tunnel movie-summary-festival-prizes').contains(field);
    });
  }

  public assertStoryline(fields: string[]) {
    fields.forEach(field => {
      cy.get('catalog-summary-tunnel movie-summary-story').contains(field);
    });
  }

  public assertCredit(fields: string[]) {
    fields.forEach(field => {
      cy.get('catalog-summary-tunnel movie-summary-credit').contains(field);
    });
  }

  public assertBudget(fields: string[]) {
    fields.forEach(field => {
      cy.get('catalog-summary-tunnel movie-summary-budget').contains(field);
    });
  }

  public assertTechnicalInfo(fields: string[]) {
    fields.forEach(field => {
      cy.get('catalog-summary-tunnel movie-summary-technical-information').contains(field);
    });
  }

  public assertLinks(fields: string[]) {
    fields.forEach(field => {
      cy.get('catalog-summary-tunnel movie-summary-file').contains(field);
    });
  }

  public assertEvaluation(field: string) {
    cy.get('catalog-summary-tunnel movie-summary-evaluation').contains(field);
  }
}
