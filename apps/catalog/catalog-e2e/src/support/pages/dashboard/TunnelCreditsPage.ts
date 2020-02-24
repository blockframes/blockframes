import TunnelBudgetPage from "./TunnelBudgetPage";

export default class TunnelCreditsPage {
  constructor() {
    cy.get('catalog-movie-tunnel-credits', { timeout: 5000 });
  }

  public static navigateToPage(movieId: string) {
    cy.visit(`c/o/dashboard/tunnel/movie/${movieId}/credits`);
    return new TunnelCreditsPage();
  }

  public fillProductionYear(year: string) {
    cy.get('catalog-movie-tunnel-credits movie-form-production-year input').type(year);
  }

  public assertProductionYearExists(year: string) {
    cy.get('catalog-movie-tunnel-credits movie-form-production-year input').should('have.value', year);
  }

  public fillFirstProductioncompany(company: string) {
    cy.get('catalog-movie-tunnel-credits [test-id=production] input[test-id=name]').first().type(company);
  }

  public assertFirstProductioncompanyExists(company: string) {
    cy.get('catalog-movie-tunnel-credits [test-id=production] input[test-id=name]').first().should('have.value', company);
  }

  public clickAddProductioncompany() {
    cy.get('catalog-movie-tunnel-credits [test-id=production] button[test-id=add]').click();
  }

  public assertNumberOfcompanyFields(number: number) {
    cy.get('catalog-movie-tunnel-credits [test-id=production] input[test-id=name]').should('have.length', number);
  }

  public fillLastProductioncompany(company: string) {
    cy.get('catalog-movie-tunnel-credits [test-id=production] input[test-id=name]').last().type(company);
  }

  public assertLastProductioncompanyExists(company: string) {
    cy.get('catalog-movie-tunnel-credits [test-id=production] input[test-id=name]').last().should('have.value', company);
  }

  public fillFirstCountryProductioncompany(country: string) {
    cy.get('catalog-movie-tunnel-credits [test-id=production] [test-id=auto-complete] input').first().type(country);
  }

  public selectCountryProductioncompany(country: string) {
    cy.get('mat-option').contains(country).click();
  }

  public assertFirstCountryProductioncompanyExists(country: string) {
    cy.get('catalog-movie-tunnel-credits [test-id=production] [test-id=auto-complete] mat-chip').first().contains(country);
  }

  public fillLastCountryProductioncompany(country: string) {
    cy.get('catalog-movie-tunnel-credits [test-id=production] [test-id=auto-complete] input').last().type(country);
  }

  public assertLastCountryProductioncompanyExists(country: string) {
    cy.get('catalog-movie-tunnel-credits [test-id=production] [test-id=auto-complete] mat-chip').last().contains(country);
  }

  public clickNext() {
    cy.get('[test-id=next]').click();
    return new TunnelBudgetPage();
  }
}
