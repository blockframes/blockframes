import TunnelDistributionRightPage from "./TunnelDistributionRightPage";

export default class TunnelKeywordsPage {
  constructor() {
    cy.get('catalog-tunnel-keywords', { timeout: 5000 });
  }

  public static navigateToPage() {
    cy.visit('c/o/dashboard/movie-tunnel/create/keywords');
    return new TunnelKeywordsPage();
  }

  public fillKeyword(keyword: string) {
    cy.get('catalog-tunnel-keywords input').type(keyword);
  }

  public fillComma() {
    cy.get('catalog-tunnel-keywords input').type(',');
  }

  public assertMatChipExists(keyword: string) {
    cy.get('catalog-tunnel-keywords mat-chip').contains(keyword);
  }

  public clickNext() {
    cy.get('catalog-tunnel-keywords [test-id=next]').click();
    return new TunnelDistributionRightPage();
  }
}
