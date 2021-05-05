import ViewPage from "./ViewPage";
import NavbarPage from "./NavbarPage";
import { Avails } from "@blockframes/e2e/utils/type";
import { SEC } from "@blockframes/e2e/utils/env";

export default class SearchPage extends NavbarPage {

  constructor() {
    super();
    cy.get('catalog-marketplace-title-list', {timeout: 60 * SEC});
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

  public checkMovieCardDisappears(title: string) {
    cy.get(`movie-card article h6[value="${title}"]`, {timeout: 30 * SEC}).should('not.exist');
  }

  public searchForMovies(title: string) {
    cy.get('input[test-id="search-input"]', {timeout: 3 * SEC})
      .type(title);
    cy.wait(0.5 * SEC);
  }

  /////////////
  // FILTERS //
  /////////////
  public clearAllFilters() {
    cy.get('[mattooltip="Clear all filters"]', {timeout: 3 * SEC})
      .click();
    cy.wait(3 * SEC);
  }

  /** Fill all fields of the avails filter. Mandatory to be able to add movie to the bucket (selection page) */
  public fillAvailFilter(avail: Avails) {
    cy.get('catalog-marketplace-title-list button', {timeout: 3 * SEC}).contains('Avails').click();

    // TERRITORIES
    cy.get('avails-filter static-group[test-id="territories"]', {timeout: 3 * SEC}).click();
    for(const territory of avail.territories) {
      if(territory === 'world') {
        cy.get('mat-checkbox[test-id="checked-all"]', {timeout: 3 * SEC}).click();
      } else {
        cy.get('mat-option', {timeout: 3 * SEC}).contains(territory).click({force: true});
      }
    }
    cy.log('Territories filled');
    // Allow the closure of the static-group component
    cy.get('input[test-id="search-input-control"]', {timeout: 3 * SEC}).type('{esc}');

    cy.wait(1 * SEC);

    // DATES
    cy.get('avails-filter mat-datepicker-toggle[test-id="dateFrom"]', {timeout: 3 * SEC}).click();
    cy.get('button.mat-calendar-period-button', {timeout: 3 * SEC}).click();
    cy.get('td.mat-calendar-body-cell', {timeout: 3 * SEC}).contains(avail.from.year).click();
    cy.get('td.mat-calendar-body-cell', {timeout: 3 * SEC}).contains(avail.from.month.toUpperCase()).click();
    cy.get('td.mat-calendar-body-cell', {timeout: 3 * SEC}).contains(avail.from.day).click();
    cy.wait(1 * SEC);

    cy.get('avails-filter mat-datepicker-toggle[test-id="dateTo"]', {timeout: 3 * SEC}).click();
    cy.get('button.mat-calendar-period-button', {timeout: 3 * SEC}).click();
    cy.get('td.mat-calendar-body-cell', {timeout: 3 * SEC}).contains(avail.to.year).click();
    cy.get('td.mat-calendar-body-cell', {timeout: 3 * SEC}).contains(avail.to.month.toUpperCase()).click();
    cy.get('td.mat-calendar-body-cell', {timeout: 3 * SEC}).contains(avail.to.day).click();
    cy.wait(1 * SEC);

    cy.log('Dates filled');

    // MEDIAS
    cy.get('avails-filter static-group[test-id="medias"]', {timeout: 3 * SEC}).click();
    for(const media of avail.medias) {
      cy.get('mat-option', {timeout: 3 * SEC}).contains(media).click({force: true});
      cy.wait(1 * SEC);
    }
    cy.log('Medias filled');
    // Allow the closure of the static-group component
    cy.get('input[test-id="search-input-control"]', {timeout: 3 * SEC}).type('{esc}');

    // EXCLUSIVE
    if(!avail.exclusive) {
      cy.get('mat-select[formControlName="exclusive"]', {timeout: 3 * SEC}).click();
      cy.get(`mat-option`, {timeout: 3 * SEC}).contains('Non exclusive').click();
    }
    cy.log('Exclusive changed');
    cy.wait(1 * SEC);

    cy.get('button[test-id="save-filter"]', {timeout: 3 * SEC}).click();
  }

  ///////////////////////////
  // ACTIONS ON MOVIE CARD //
  ///////////////////////////
  public clickWishlistButton(movieName: string) {
    cy.get('movie-card', {timeout: 30 * SEC})
      .contains(movieName).parent().parent()
      .find('button[test-id=heart-button]').click('bottom', {force: true} );
    cy.wait(2000);
  }

  /** Add movie to the selection to create an offer */
  public addToBucket(title: string) {
    cy.get('movie-card', {timeout: 30 * SEC})
      .contains(title).parent().parent()
      .find('button[test-id="add-to-bucket"]').click();
  }

  /** Click on a movie-card and navigate to the movie-view */
  public selectMovie(movieName: string) {
    cy.log(`=>selectMovie : {${movieName}}`);
    cy.get('movie-card', {timeout: 30 * SEC})
      .contains(movieName).parent().parent()
      .find('a').click();
    return new ViewPage();
  }
}

