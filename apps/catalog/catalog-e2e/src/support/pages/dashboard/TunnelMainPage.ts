export default class TunnelMainPage {
  constructor() {
    cy.get('catalog-movie-tunnel-main', { timeout: 5000 });
  }

  public static navigateToPage(movieId: string) {
    cy.visit(`c/o/dashboard/tunnel/movie/${movieId}/main`);
    return new TunnelMainPage();
  }

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
}
