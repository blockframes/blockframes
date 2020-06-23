import TitlesDetailsPage from "./TitlesDetailsPage";

export default class TunnelSummaryPage {
  constructor() {
    cy.get('catalog-summary-tunnel');
  }

  public clickSubmit() {
    cy.get('catalog-summary-tunnel button[test-id=submit]').click();
    return new TitlesDetailsPage();
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
}
