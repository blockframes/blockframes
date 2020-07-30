import ViewPage from "./ViewPage";
import NavbarPage from "./NavbarPage";
import { Dates, Availabilities } from "@blockframes/e2e/utils/type";

export default class SearchPage extends NavbarPage {

  constructor() {
    super();
    cy.get('catalog-marketplace-title-list');
  }

  public fillProductionYear(years: Dates) {
    cy.get('catalog-marketplace-title-list input[test-id=production-year-input-from]').type(years.from);
    cy.get('catalog-marketplace-title-list input[test-id=production-year-input-to]').type(years.to);
  }

  public selectGenres(genres: string[]) {
    cy.get('catalog-marketplace-title-list [test-id=genres-panel]').click();
    genres.forEach(genre => cy.get('catalog-marketplace-title-list mat-checkbox').contains(genre).click());
  }

  public selectLanguages(language: string) {
    cy.get('catalog-marketplace-title-list [test-id=languages-panel]').click();
    cy.get('catalog-marketplace-title-list input[test-id=languages-panel-input]').type(language);
    cy.get('mat-option').contains(language).click();
    cy.get('catalog-marketplace-title-list mat-checkbox').contains('Original').click();
    cy.get('catalog-marketplace-title-list button[test-id=languages]').click();
  }

  public selectCertifications(certification: string) {
    cy.get('catalog-marketplace-title-list [test-id=certifications-panel]').click();
    cy.get('catalog-marketplace-title-list mat-checkbox').contains(certification).click();
  }

  public selectAvailabilities(date: Availabilities) {
    cy.get('catalog-marketplace-title-list [test-id=availabilities-panel]').click();
    cy.get('[test-id=datepicker-from]').click();
    cy.get(`[aria-label=${date.yearFrom}]`).click();
    cy.get(`[aria-label="${date.monthFrom} ${date.yearFrom}"]`).click();
    cy.get(`[aria-label="${date.monthFrom} ${date.dayFrom}, ${date.yearFrom}"]`).click();
    cy.get('[test-id=datepicker-to]').click();
    cy.get(`[aria-label=${date.yearTo}]`).click();
    cy.get(`[aria-label="${date.monthTo} ${date.yearTo}"]`).click();
    cy.get(`[aria-label="${date.monthTo} ${date.dayTo}, ${date.yearTo}"]`).click();
  }

  // TODO: fixing mat-option referencing first input => ISSUE#950
  public selectTerritories(territory: string) {
    cy.get('catalog-marketplace-title-list [test-id=territories-panel]').click();
    cy.get('catalog-marketplace-title-list input[test-id=territories-panel-input]').type(territory);
    cy.get('mat-option').contains(territory).click();
  }

  public selectMandateMedias(medias: string[]) {
    cy.get('catalog-marketplace-title-list [test-id=mandate-medias-panel]').click();
    medias.forEach(media => cy.get('catalog-marketplace-title-list mat-checkbox').contains(media).click());
  }

  public selectMovie(movieName: string) {
    cy.get('movie-card', {timeout: 30000})
      .contains(movieName).parent().parent()
      .find('a').click();
    return new ViewPage();
  }

  public clickWishlistButton(movieName: string) {
    cy.get('movie-card', {timeout: 30000})
      .contains(movieName).parent().parent()
      .find('button[test-id=heart-button]').click();
  }
}

