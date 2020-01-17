import TunnelVersionInfoPage from "./TunnelVersionInfoPage";

export default class TunnelBudgetPage {
  constructor() {
    cy.get('catalog-movie-tunnel-budget', { timeout: 5000 });
  }

  public static navigateToPage() {
    cy.visit('c/o/dashboard/movie-tunnel/create/budget');
    return new TunnelBudgetPage();
  }

  public selectBudgetRange(budget: string) {
    cy.get('catalog-movie-tunnel-budget [test-id=budget-range]').click();
    cy.get('mat-option').contains(budget).click();
  }

  public assertBudgetRangeIsSelected(budget: string) {
    cy.get('catalog-movie-tunnel-budget [test-id=budget-range]').contains(budget);
  }

  public selectQuota(quota: string) {
    cy.get('catalog-movie-tunnel-budget movie-form-certifications mat-button-toggle').contains(quota).click();
  }

  public assertQuotaIsSelected(quota: string) {
    cy.get('catalog-movie-tunnel-budget movie-form-certifications mat-button-toggle')
      .contains(quota).should('have.attr', 'aria-pressed', 'true');
  }

  public clickNext() {
    cy.get('[test-id=next]').click();
    return new TunnelVersionInfoPage();
  }
}
