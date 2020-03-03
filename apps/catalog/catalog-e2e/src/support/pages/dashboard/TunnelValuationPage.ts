import TunnelSummaryPage from "./TunnelSummaryPage";

export default class TunnelValuationPage {
  constructor() {
    cy.get('catalog-movie-tunnel-evaluation', { timeout: 5000 });
  }

  public static navigateToPage(movieId: string) {
    cy.visit(`c/o/dashboard/tunnel/movie/${movieId}/evaluation`);
    return new TunnelValuationPage();
  }

  public selectValuation(valuation: string) {
    cy.get('catalog-movie-tunnel-evaluation movie-form-scoring mat-select').click();
    cy.get('mat-option').contains(valuation).click();
  }

  public assertValuationIsSelected(valuation: string) {
    cy.get('catalog-movie-tunnel-evaluation movie-form-scoring mat-select').contains(valuation);
  }

  public clickNext() {
    cy.get('[test-id=next]').click();
    return new TunnelSummaryPage();
  }
}
