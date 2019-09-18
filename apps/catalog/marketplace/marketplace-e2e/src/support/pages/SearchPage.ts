import { ViewPage } from ".";

export default class SearchPage {

  constructor() {
    cy.get('[page-id=catalog-search]', { timeout: 10000 });
  }

  public fillProductionYear(from: string, to: string) {
    cy.get('[page-id=catalog-search] [test-id=production-year-panel]').click();
    cy.get('[page-id=catalog-search] input[test-id=production-year-input-from]').type(from);
    cy.get('[page-id=catalog-search] input[test-id=production-year-input-to]').type(to);
  }

  public selectGenres(genres: string[]) {
    cy.get('[page-id=catalog-search] [test-id=genres-panel]').click();
    genres.forEach(genre => cy.get('[page-id=catalog-search] mat-checkbox').contains(genre).click());
  }

  public selectLanguages(language: string) {
    cy.get('[page-id=catalog-search] [test-id=languages-panel]').click();
    cy.get('[page-id=catalog-search] input[test-id=languages-panel-input]').type(language);
    cy.get('mat-option').contains(language).click();
    cy.get('[page-id=catalog-search] mat-checkbox').contains('Original').click();
    cy.get('[page-id=catalog-search] button[test-id=languages]').click();
  }

  public selectCertifications(certification: string) {
    cy.get('[page-id=catalog-search] [test-id=certifications-panel]').click();
    cy.get('[page-id=catalog-search] mat-checkbox').contains(certification).click();
  }

  public selectAvailabilities(date) {
    cy.get('[page-id=catalog-search] [test-id=availabilities-panel]').click();
    cy.get('[test-id=datepicker-from]').click();
    cy.get(`[aria-label=${date.yearFrom}]`).click();
    cy.get(`[aria-label="${date.monthFrom} ${date.yearFrom}"]`).click();
    cy.get(`[aria-label="${date.monthFrom} ${date.dayFrom}, ${date.yearFrom}"]`).click();
    cy.get('[test-id=datepicker-to]').click();
    cy.get(`[aria-label=${date.yearTo}]`).click();
    cy.get(`[aria-label="${date.monthTo} ${date.yearTo}"]`).click();
    cy.get(`[aria-label="${date.monthTo} ${date.dayTo}, ${date.yearTo}"]`).click();
  }

  public selectTerritories(territory: string) {
    cy.get('[page-id=catalog-search] [test-id=territories-panel]').click();
    cy.get('[page-id=catalog-search] input[test-id=territories-panel-input]').type(territory);
    cy.get('mat-option').contains(territory).click();
    // TODO: fixing mat-option referencing first input
    // territories.forEach(territory => {
    //   cy.get('[page-id=catalog-search] input[test-id=territories-panel-input]').type(territory);
    //   cy.get('mat-option', {timeout: 5000}).contains(territory).click();
    // });
  }

  public selectMandateMedias(medias: string[]) {
    cy.get('[page-id=catalog-search] [test-id=mandate-medias-panel]').click();
    medias.forEach(media => cy.get('[page-id=catalog-search] mat-checkbox').contains(media).click());
  }

  public selectMovie() {
    cy.get('[page-id=display-card] [test-id=movie-card-title]', { timeout: 10000 }).contains('Eternal Sunshine of the Spotless Mind').click()
    return new ViewPage();
  }
}

