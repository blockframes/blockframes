/// <reference types="cypress" />

import { LoginPage, AddMovieModal, MovieEditPage, LandingPage, MovieCreatePage, HomePage } from "../support/pages";
import { User } from "../support/utils/type";

// CONSTS

const INPUTS_FORM = {
  [MovieEditPage.FIELD_INTERNATIONAL_TITLE]: 'The terminator',
  [MovieEditPage.FIELD_DIRECTORS]: ['Bruce'],
  [MovieEditPage.FIELD_PRODUCTION_YEAR]: '2019',
};

const OPTIONS_FORM = {
  [MovieEditPage.OPTION_TYPES]: ['fiction', 'documentary'],
  [MovieEditPage.OPTION_GENRES]: ['thriller', 'horror'],
  [MovieEditPage.OPTION_ORIGIN_COUNTRIES]: ['france'],
  [MovieEditPage.OPTION_PRODUCER_COUNTRY]: ['france'],
  [MovieEditPage.OPTION_LANGUAGES]: ['french'],
  [MovieEditPage.OPTION_STATUS]: ['shooting']
};

const USER: Partial<User> = {
  email: 'cypressCRUDMOVIE@blockframes.com',
  password: 'blockframes'
}

const MOVIES_CYTEST = ['Terminator', 'Kung Fury'];

// TESTS

beforeEach(() => {
  cy.clearCookies();
  cy.clearLocalStorage();
  cy.visit('/auth');
  cy.viewport('ipad-2', 'landscape');
  const p1: LandingPage = new LandingPage();
  const p2: LoginPage = p1.clickCallToAction();
  p2.fillSignin(USER);
});

describe('User create a movie', () => {
  it('should login, open the movie title form, and add a movie', () => {
    const p1 = new LoginPage();
    const p2: MovieCreatePage = p1.clickSigninWithNoMovies();

    // Create a movie
    const p4: AddMovieModal = p2.clickAddMovie();
    p4.fillMovieName(MOVIES_CYTEST[0]);
    const p5: MovieEditPage = p4.clickCreate();
    p5.assertMovieTitleExists(MOVIES_CYTEST[0])
  });
});

describe('User create and update another movie', () => {
  it('should login, open the movie title form, add movie, then update it', () => {
    const p1 = new LoginPage();
    const p2: HomePage = p1.clickSigninWithMovies();

    // Assert movie from previous test exists
    p2.assertMovieExists(MOVIES_CYTEST[0])

    // Create a movie
    const p3: AddMovieModal = p2.clickAddMovie();
    p3.fillMovieName(MOVIES_CYTEST[1]);
    p3.clickCreate();

    // Let Master Bruce do it
  });
});

describe('User delete two movies', () => {
  it('should login, delete two movies, then assert that they are deleted', () => {
    const p1 = new LoginPage();
    const p2: HomePage = p1.clickSigninWithMovies();

    // Assert movies from previous test exist, delete them,
    // then assert movies don't exist anymore
    MOVIES_CYTEST.forEach(movie => {
      p2.assertMovieExists(movie);
      p2.displayMovieMenu(movie);
      p2.clickDelete();
      p2.assertMovieNotExists(movie);
    });
  });
});
