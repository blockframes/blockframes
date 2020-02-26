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
}
