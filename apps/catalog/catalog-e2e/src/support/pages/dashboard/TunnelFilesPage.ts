import TunnelChainOfTitlesPage from "./TunnelChainOfTitlesPage";

export default class TunnelFilesPage {
  constructor() {
    cy.get('catalog-movie-tunnel-media-file', { timeout: 5000 });
  }

  // File Links

  fillPromoReelLink(link: string) {
    cy.get('catalog-movie-tunnel-media-file movie-form-promotional-links mat-form-field').contains('Promo reel Link').parent().parent().find('input').type(link);
  }

  assertPromoReelLinkExists(link: string) {
    cy.get('catalog-movie-tunnel-media-file movie-form-promotional-links mat-form-field').contains('Promo reel Link').parent().parent().find('input').should('have.value', link);
  }

  fillScreenerLink(link: string) {
    cy.get('catalog-movie-tunnel-media-file movie-form-promotional-links mat-form-field').contains('Screener Link').parent().parent().find('input').type(link);
  }

  assertScreenerLinkExists(link: string) {
    cy.get('catalog-movie-tunnel-media-file movie-form-promotional-links mat-form-field').contains('Screener Link').parent().parent().find('input').should('have.value', link);
  }

  fillTrailerLink(link: string) {
    cy.get('catalog-movie-tunnel-media-file movie-form-promotional-links mat-form-field').contains('Trailer Link').parent().parent().find('input').type(link);
  }

  assertTrailerLinkExists(link: string) {
    cy.get('catalog-movie-tunnel-media-file movie-form-promotional-links mat-form-field').contains('Trailer Link').parent().parent().find('input').should('have.value', link);
  }

  fillPitchTeaserLink(link: string) {
    cy.get('catalog-movie-tunnel-media-file movie-form-promotional-links mat-form-field').contains('Pitch Teaser Link').parent().parent().find('input').type(link);
  }

  assertPitchTeaserLinkExists(link: string) {
    cy.get('catalog-movie-tunnel-media-file movie-form-promotional-links mat-form-field').contains('Pitch Teaser Link').parent().parent().find('input').should('have.value', link);
  }

  public clickNext() {
    cy.get('[test-id=next]').click();
    return new TunnelChainOfTitlesPage();
  }
}
