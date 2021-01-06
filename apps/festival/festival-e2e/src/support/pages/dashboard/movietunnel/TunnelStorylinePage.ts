import { SEC } from '@blockframes/e2e/utils/env';

export default class TunnelStorylinePage {
  constructor() {
    cy.get('catalog-tunnel-synopsis', { timeout: 60 * SEC });
  }

  public static navigateToPage(movieId: string) {
    cy.visit(`c/o/dashboard/tunnel/movie/${movieId}/synopsis`);
    return new TunnelStorylinePage();
  }

  public fillKeyword(keyword: string) {
    cy.get('catalog-tunnel-synopsis input').type(keyword);
  }

  public fillComma() {
    cy.get('catalog-tunnel-synopsis input').type(',');
  }

  public assertMatChipExists(keyword: string) {
    cy.get('catalog-tunnel-synopsis mat-chip').contains(keyword);
  }

  public fillSynopsis(synopsis: string) {
    cy.get('catalog-tunnel-synopsis movie-form-synopsis textarea').type(synopsis);
  }

  public assertSynopsisExists(synopsis: string) {
    cy.get('catalog-tunnel-synopsis movie-form-synopsis textarea').should('have.value', synopsis);
  }

  public fillKeyAssets(key: string) {
    cy.get('catalog-tunnel-synopsis movie-form-key-assets textarea').type(key);
  }

  public assertKeyAssetsExists(key: string) {
    cy.get('catalog-tunnel-synopsis movie-form-key-assets textarea').should('have.value', key);
  }

  public clickNext() {
    cy.get('[test-id=next]').click();
  }
}
