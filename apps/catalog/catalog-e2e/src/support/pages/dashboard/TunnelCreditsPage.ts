import TunnelBudgetPage from "./TunnelBudgetPage";

export default class TunnelCreditsPage {
  constructor() {
    cy.get('catalog-movie-tunnel-credits', { timeout: 5000 });
  }

  public static navigateToPage() {
    cy.visit('c/o/dashboard/movie-tunnel/create/credits');
    return new TunnelCreditsPage();
  }

  public fillProductionYear(year: string) {
    cy.get('catalog-movie-tunnel-credits movie-form-production-year input').type(year);
  }

  public assertProductionYearExists(year: string) {
    cy.get('catalog-movie-tunnel-credits movie-form-production-year input').should('have.value', year);
  }

  public fillFirstProductionCompagny(compagny: string) {
    cy.get('catalog-movie-tunnel-credits movie-form-stakeholders input').first().type(compagny);
  }

  public assertFirstProductionCompagnyExists(compagny: string) {
    cy.get('catalog-movie-tunnel-credits movie-form-stakeholders input').first().should('have.value', compagny);
  }

  public clickAddProductionCompagny() {
    cy.get('catalog-movie-tunnel-credits movie-form-stakeholders button[test-id=add]').click();
  }

  public assertNumberOfCompagnyFields(number: number) {
    cy.get('catalog-movie-tunnel-credits movie-form-stakeholders input').should('have.length', number);
  }

  public fillLastProductionCompagny(compagny: string) {
    cy.get('catalog-movie-tunnel-credits movie-form-stakeholders input').last().type(compagny);
  }

  public assertLastProductionCompagnyExists(compagny: string) {
    cy.get('catalog-movie-tunnel-credits movie-form-stakeholders input').last().should('have.value', compagny);
  }

  public clickNext() {
    cy.get('[test-id=next]').click();
    return new TunnelBudgetPage();
  }
}
