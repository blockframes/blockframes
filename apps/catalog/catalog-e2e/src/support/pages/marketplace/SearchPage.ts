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
    cy.get(`movie-card article h6[value="${title}"]`).should('not.exist');
  }

  /////////////
  // FILTERS //
  /////////////
  public clearAllFilters() {
    cy.get('[mattooltip="Clear all filters"]', {timeout: 3 * SEC})
      .click();
    cy.wait(3 * SEC);
  }

  //! Need to be reworked
  public selectGenres(genres: string[]) {
    cy.get('catalog-marketplace-title-list [test-id=genres-panel]').click();
    genres.forEach(genre => cy.get('catalog-marketplace-title-list mat-checkbox').contains(genre).click());
  }

  //! Need to be reworked
  public selectLanguages(language: string) {
    cy.get('catalog-marketplace-title-list [test-id=languages-panel]').click();
    cy.get('catalog-marketplace-title-list input[test-id=languages-panel-input]').type(language);
    cy.get('mat-option').contains(language).click();
    cy.get('catalog-marketplace-title-list mat-checkbox').contains('Original').click();
    cy.get('catalog-marketplace-title-list button[test-id=languages]').click();
  }

  /** Fill all fields of the avails filter. Mandatory to be able to add movie to the bucket (selection page) */
  public fillAvailFilter(avail: Avails) {
    cy.get('catalog-marketplace-title-list button').contains('Avails').click();

    // TERRITORIES
    cy.get('avails-filter static-group[test-id="territories"]').click();
    for(const territory of avail.territories) {
      if(territory === 'world') {
        cy.get('mat-checkbox[test-id="checked-all"]').click();
      } else {
        cy.get('mat-option').contains(territory).click({force: true});
      }
    }
    // Allow the closure of the static-group component
    cy.get('input[test-id="search-input"]').type('{esc}');

    cy.wait(1 * SEC);

    // DATES
    cy.get('avails-filter mat-datepicker-toggle[test-id="dateFrom"]').click();
    cy.get('button.mat-calendar-period-button').click();
    cy.get('td.mat-calendar-body-cell').contains(avail.from.year).click();
    cy.get('td.mat-calendar-body-cell').contains(avail.from.month.toUpperCase()).click();
    cy.get('td.mat-calendar-body-cell').contains(avail.from.day).click();
    cy.wait(1 * SEC);

    cy.get('avails-filter mat-datepicker-toggle[test-id="dateTo"]').click();
    cy.get('button.mat-calendar-period-button').click();
    cy.get('td.mat-calendar-body-cell').contains(avail.to.year).click();
    cy.get('td.mat-calendar-body-cell').contains(avail.to.month.toUpperCase()).click();
    cy.get('td.mat-calendar-body-cell').contains(avail.to.day).click();
    cy.wait(1 * SEC);

    // MEDIAS
    cy.get('avails-filter static-group[test-id="medias"]').click();
    for(const media of avail.medias) {
      cy.get('mat-option').contains(media).click({force: true});
      cy.wait(1 * SEC);
    }
    // Allow the closure of the static-group component
    cy.get('input[test-id="search-input"]').type('{esc}');

    // EXCLUSIVE
    if(!avail.exclusive) {
      cy.get('mat-select[formControlName="exclusive"]').click();
      cy.get(`mat-option`).contains('Non exclusive').click();
    }
    cy.wait(1 * SEC);

    cy.get('button[test-id="save-filter"]').click();
  }

  ////////////////////////////////////////////////////
  // NAVIGATE TO OTHER PAGE OR ACTION ON MOVIE CARD //
  ////////////////////////////////////////////////////
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

