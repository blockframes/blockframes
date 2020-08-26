import TunnelChainOfTitlesPage from "./TunnelChainOfTitlesPage";
import { uploadFile, assertUploadStatus } from "@blockframes/e2e/utils/functions";

const UPLOAD_STATUS = 'Your file is ready, it will be uploaded when you click on "Save".';

export default class TunnelFilesPage {
  constructor() {
    cy.get('catalog-movie-tunnel-media-file');
  }

  // Files

  public uploadPresentationDeck(p: string) {
    uploadFile(p, 'application/pdf', 'presentation-deck');
  }

  public assertPresentationDeckHasUploadSucceeded() {
    assertUploadStatus(UPLOAD_STATUS, 'presentation-deck');
  }

  public uploadScenario(p: string) {
    uploadFile(p, 'application/pdf', 'scenario');
  }

  public assertScenarioHasUploadSucceeded() {
    assertUploadStatus(UPLOAD_STATUS, 'scenario');
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
