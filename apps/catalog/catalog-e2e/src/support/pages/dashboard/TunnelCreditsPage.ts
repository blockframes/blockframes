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

  public fillFirstProductioncompany(testId: string, company: string) {
    cy.get(`catalog-movie-tunnel-credits [test-id=${testId}] input[test-id=name]`).first().type(company);
  }

  public assertFirstProductioncompanyExists(testId: string, company: string) {
    cy.get(`catalog-movie-tunnel-credits [test-id=${testId}] input[test-id=name]`).first().should(`have.value`, company);
  }

  public clickAddProductioncompany(testId: string) {
    cy.get(`catalog-movie-tunnel-credits [test-id=${testId}] button[test-id=add]`).click();
  }

  public fillLastProductioncompany(testId: string, company: string) {
    cy.get(`catalog-movie-tunnel-credits [test-id=${testId}] input[test-id=name]`).last().type(company);
  }

  public assertLastProductioncompanyExists(testId: string, company: string) {
    cy.get(`catalog-movie-tunnel-credits [test-id=${testId}] input[test-id=name]`).last().should('have.value', company);
  }

  public fillFirstCountryProductioncompany(testId: string, country: string) {
    cy.get(`catalog-movie-tunnel-credits [test-id=${testId}] [test-id=auto-complete] input`).first().type(country);
  }

  public selectCountryProductioncompany(country: string) {
    cy.get('mat-option').contains(country).click();
  }

  public assertFirstCountryProductioncompanyExists(testId: string, country: string) {
    cy.get(`catalog-movie-tunnel-credits [test-id=${testId}] [test-id=auto-complete] mat-chip`).first().contains(country);
  }

  public fillLastCountryProductioncompany(testId: string, country: string) {
    cy.get(`catalog-movie-tunnel-credits [test-id=${testId}] [test-id=auto-complete] input`).last().type(country);
  }

  public assertLastCountryProductioncompanyExists(testId: string, country: string) {
    cy.get(`catalog-movie-tunnel-credits [test-id=${testId}] [test-id=auto-complete] mat-chip`).last().contains(country);
  }

  // Sales Cast

  public fillFirstSalesCastFirstName(testId: string, name: string) {
    cy.get(`catalog-movie-tunnel-credits [test-id=${testId}] input[test-id=first-name]`).first().type(name);
  }

  public assertFirstSalesCastFirstNameExists(testId: string, name: string) {
    cy.get(`catalog-movie-tunnel-credits [test-id=${testId}] input[test-id=first-name]`).first().should(`have.value`, name);
  }

  public fillFirstSalesCastLastName(testId: string, name: string) {
    cy.get(`catalog-movie-tunnel-credits [test-id=${testId}] input[test-id=last-name]`).first().type(name);
  }

  public assertFirstSalesCastLastNameExists(testId: string, name: string) {
    cy.get(`catalog-movie-tunnel-credits [test-id=${testId}] input[test-id=last-name]`).first().should(`have.value`, name);
  }

  public clickSelectFirstSalesCastRole(testId: string) {
    cy.get(`catalog-movie-tunnel-credits [test-id=${testId}] mat-select`).first().click();
  }

  public selectSalesCastRole(role: string) {
    cy.get('mat-option').contains(role).click();
  }

  public assertFirstSalesCastRoleExists(testId: string, role: string) {
    cy.get(`catalog-movie-tunnel-credits [test-id=${testId}] mat-select`).first().contains(role);
  }

  public clickAddSalesCast(testId: string) {
    cy.get(`catalog-movie-tunnel-credits [test-id=${testId}] button`).click();
  }

  public fillLastSalesCastFirstName(testId: string, name: string) {
    cy.get(`catalog-movie-tunnel-credits [test-id=${testId}] input[test-id=first-name]`).last().type(name);
  }

  public assertLastSalesCastFirstNameExists(testId: string, name: string) {
    cy.get(`catalog-movie-tunnel-credits [test-id=${testId}] input[test-id=first-name]`).last().should(`have.value`, name);
  }

  public fillLastSalesCastLastName(testId: string, name: string) {
    cy.get(`catalog-movie-tunnel-credits [test-id=${testId}] input[test-id=last-name]`).last().type(name);
  }

  public assertLastSalesCastLastNameExists(testId: string, name: string) {
    cy.get(`catalog-movie-tunnel-credits [test-id=${testId}] input[test-id=last-name]`).last().should(`have.value`, name);
  }

  public clickSelectLastSalesCastRole(testId: string) {
    cy.get(`catalog-movie-tunnel-credits [test-id=${testId}] mat-select`).last().click();
  }

  public assertLastSalesCastRoleExists(testId: string, role: string) {
    cy.get(`catalog-movie-tunnel-credits [test-id=${testId}] mat-select`).last().contains(role);
  }

  public clickNext() {
    cy.get('[test-id=next]').click();
    return new TunnelBudgetPage();
  }
}
