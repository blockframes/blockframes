import ViewPage from "./ViewPage";
import NavbarPage from "./NavbarPage";
import { Dates, Availabilities } from "@blockframes/e2e/utils/type";
import { SEC } from "@blockframes/e2e/utils/env";

export default class SearchPage extends NavbarPage {

  constructor() {
    super();
    cy.get('catalog-marketplace-title-list', {timeout: 60 * SEC});
  }

  public clearAllFilters(optionSortBy: string) {
    // TODO: After Issue #3584 is fixed this may be needed back.
    // cy.get('mat-select').click();
    // cy.get('mat-option')
    //   .contains(optionSortBy)
    //   .click();
    cy.get('[mattooltip="Clear all filters"]', {timeout: 3 * SEC})
      .click();
    cy.wait(3 * SEC);
  }

  public addToBucket(title: string) {
    cy.get('movie-card', {timeout: 30 * SEC})
      .contains(title).parent().parent()
      .find('button[test-id="add-to-bucket"]').click();
  }

  public fillAvailFilter() {
    cy.get('catalog-marketplace-title-list button').contains('Avails').click();
    cy.get('avails-filter static-group[test-id="territories"]').click();
    cy.get('mat-checkbox[test-id="checked-all"]').click();
    cy.get('input[test-id="search-input"]').type('{esc}');

    cy.wait(1 * SEC);

    cy.get('avails-filter mat-datepicker-toggle[test-id="dateFrom"]').click();
    cy.get('button.mat-calendar-period-button').click();
    cy.get('td.mat-calendar-body-cell').contains('2025').click();
    cy.get('td.mat-calendar-body-cell').contains('JAN').click();
    cy.get('td.mat-calendar-body-cell').contains('1').click();

    cy.get('avails-filter mat-datepicker-toggle[test-id="dateTo"]').click();
    cy.get('button.mat-calendar-period-button').click();
    cy.get('td.mat-calendar-body-cell').contains('2026').click();
    cy.get('td.mat-calendar-body-cell').contains('DEC').click();
    cy.get('td.mat-calendar-body-cell').contains('31').click();

    cy.get('avails-filter static-group[test-id="medias"]').click();
    cy.get('mat-option').contains('S-VOD').click({force: true});
    cy.get('mat-option').contains('A-VOD').click({force: true});
    cy.get('input[test-id="search-input"]').type('{esc}');

    cy.get('mat-select[formControlName="exclusive"]').click();
    cy.get('mat-option').contains('Exclusive').click();

    cy.get('button[test-id="save-filter"]').click();
  }

  //! Not available anymore
  // public fillProductionYear(years: Dates) {
  //   cy.get('catalog-marketplace-title-list input[test-id=production-year-input-from]').type(years.from);
  //   cy.get('catalog-marketplace-title-list input[test-id=production-year-input-to]').type(years.to);
  // }

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

  //! Not available anymore
  // public selectCertifications(certification: string) {
  //   cy.get('catalog-marketplace-title-list [test-id=certifications-panel]').click();
  //   cy.get('catalog-marketplace-title-list mat-checkbox').contains(certification).click();
  // }

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
    cy.log(`=>selectMovie : {${movieName}}`);
    cy.get('movie-card', {timeout: 30 * SEC})
      .contains(movieName).parent().parent()
      .find('a').click();
    return new ViewPage();
  }

  public clickWishlistButton(movieName: string) {
    cy.get('movie-card', {timeout: 30 * SEC})
      .contains(movieName).parent().parent()
      .find('button[test-id=heart-button]').click('bottom', {force: true} );
    cy.wait(2000);
  }

  public  getAllMovies(movieCount: number) {
    const movies = [];
    cy.get('movie-card article h6', {timeout: 30 * SEC}).then((m) => {
      for (let i =0; i < movieCount; i++) {
        movies.push(m[i].firstChild.textContent);
      }
      console.log(movies);
      cy.wrap(movies).as('movieList');
    })
  }
}

