export default class TunnelMainPage {
  constructor() {
    cy.get('catalog-movie-tunnel-main', { timeout: 5000 });
  }

  public static navigateToPage(movieId: string) {
    cy.visit(`c/o/dashboard/tunnel/movie/${movieId}/main`);
    return new TunnelMainPage();
  }

  // Content Type

  public clickContentType() {
    cy.get('catalog-movie-tunnel-main movie-form-content-type mat-select[test-id=content-type]').click();
  }

  public selectContentType(contentType: string) {
    cy.get('mat-option').contains(contentType).click();
  }

  public assertContentTypeExists(contentType: string) {
    cy.get('catalog-movie-tunnel-main movie-form-content-type mat-select[test-id=content-type]').contains(contentType);
  }

  public clickFreshness() {
    cy.get('catalog-movie-tunnel-main movie-form-content-type mat-select[test-id=freshness]').click();
  }

  public selectFreshness(freshness: string) {
    cy.get('mat-option').contains(freshness).click();
  }

  public assertFreshnessExists(freshness: string) {
    cy.get('catalog-movie-tunnel-main movie-form-content-type mat-select[test-id=freshness]').contains(freshness);
  }

  public clickProductionStatus() {
    cy.get('catalog-movie-tunnel-main movie-form-content-type mat-select[test-id=production-status]').click();
  }

  public selectProductionStatus(status: string) {
    cy.get('mat-option').contains(status).click();
  }

  public assertProductionStatusExists(status: string) {
    cy.get('catalog-movie-tunnel-main movie-form-content-type mat-select[test-id=production-status]').contains(status);
  }

  public fillInternationalTitle(title: string) {
    cy.get('catalog-movie-tunnel-main movie-form-content-type input[test-id=international-title]').type(title);
  }

  public assertInternationalTitleExists(title: string) {
    cy.get('catalog-movie-tunnel-main movie-form-content-type input[test-id=international-title]').should('have.value', title);
  }

  public fillOriginalTitle(title: string) {
    cy.get('catalog-movie-tunnel-main movie-form-content-type input[test-id=original-title]').type(title);
  }

  public assertOriginalTitleExists(title: string) {
    cy.get('catalog-movie-tunnel-main movie-form-content-type input[test-id=original-title]').should('have.value', title);
  }

  public fillReference(reference: string) {
    cy.get('catalog-movie-tunnel-main movie-form-content-type input[test-id=reference]').type(reference);
  }

  public assertReferenceExists(reference: string) {
    cy.get('catalog-movie-tunnel-main movie-form-content-type input[test-id=reference]').should('have.value', reference);
  }

  // Festival

  public fillFirstFestivalName(name: string) {
    cy.get('catalog-movie-tunnel-main movie-form-festival-prizes input[test-id=name]').first().type(name);
  }

  public assertFirstFestivalNameExists(name: string) {
    cy.get('catalog-movie-tunnel-main movie-form-festival-prizes input[test-id=name]').first().should('have.value', name);
  }

  public fillFirstFestivalAwardSelection(name: string) {
    cy.get('catalog-movie-tunnel-main movie-form-festival-prizes input[test-id=award]').first().type(name);
  }

  public assertFirstFestivalAwardSelectionExists(name: string) {
    cy.get('catalog-movie-tunnel-main movie-form-festival-prizes input[test-id=award]').first().should('have.value', name);
  }

  public fillFirstFestivalYear(year: string) {
    cy.get('catalog-movie-tunnel-main movie-form-festival-prizes input[test-id=year]').first().type(year);
  }

  public assertFirstFestivalYearExists(year: string) {
    cy.get('catalog-movie-tunnel-main movie-form-festival-prizes input[test-id=year]').first().should('have.value', year);
  }

  public selectFirstFestivalPremiere(name: string) {
    cy.get('catalog-movie-tunnel-main movie-form-festival-prizes mat-button-toggle-group')
      .first().get('mat-button-toggle').contains(name).click();
  }

  public assertFirstFestivalPremiereIsSelected(name: string) {
    cy.get('catalog-movie-tunnel-main movie-form-festival-prizes mat-button-toggle-group')
      .first().get('mat-button-toggle').contains(name).should('have.attr', 'aria-pressed', 'true');
  }

  public addFestival() {
    cy.get('catalog-movie-tunnel-main movie-form-festival-prizes button[test-id=add]').click();
  }

  public fillLastFestivalName(name: string) {
    cy.get('catalog-movie-tunnel-main movie-form-festival-prizes input[test-id=name]').last().type(name);
  }

  public assertLastFestivalNameExists(name: string) {
    cy.get('catalog-movie-tunnel-main movie-form-festival-prizes input[test-id=name]').last().should('have.value', name);
  }

  public fillLastFestivalAwardSelection(name: string) {
    cy.get('catalog-movie-tunnel-main movie-form-festival-prizes input[test-id=award]').last().type(name);
  }

  public assertLastFestivalAwardSelectionExists(name: string) {
    cy.get('catalog-movie-tunnel-main movie-form-festival-prizes input[test-id=award]').last().should('have.value', name);
  }

  public fillLastFestivalYear(year: string) {
    cy.get('catalog-movie-tunnel-main movie-form-festival-prizes input[test-id=year]').last().type(year);
  }

  public assertLastFestivalYearExists(year: string) {
    cy.get('catalog-movie-tunnel-main movie-form-festival-prizes input[test-id=year]').last().should('have.value', year);
  }
}
