/// <reference types="cypress" />
import {
  LoginViewPage,
  MovieCreatePage,
  MovieEditablePage,
  MovieListPage,
  MovieTitleFormModal, setupForIpad,
  User,
  WelcomeViewPage
} from '../support';

// CONSTS

const INPUTS_FORM = {
  [MovieEditablePage.FIELD_INTERNATIONAL_TITLE]: 'The terminator',
  [MovieEditablePage.FIELD_DIRECTORS]: ['Bruce'],
  [MovieEditablePage.FIELD_PRODUCTION_YEAR]: '2019',
};

const OPTIONS_FORM = {
  [MovieEditablePage.OPTION_TYPES]: ['fiction', 'documentary'],
  [MovieEditablePage.OPTION_GENRES]: ['thriller', 'horror'],
  [MovieEditablePage.OPTION_ORIGIN_COUNTRIES]: ['france'],
  [MovieEditablePage.OPTION_PRODUCER_COUNTRY]: ['france'],
  [MovieEditablePage.OPTION_LANGUAGES]: ['french'],
  [MovieEditablePage.OPTION_STATUS]: ['shooting']
};

const USER: Partial<User> = {
  email: 'cypressCRUDMOVIE@blockframes.com',
  password: 'blockframes'
}

const MOVIES_CYTEST = ['Terminator', 'Kung Fury'];

// TESTS

beforeEach(() => {
  setupForIpad();
  const p1: WelcomeViewPage = new WelcomeViewPage();
  const p2: LoginViewPage = p1.clickCallToAction();
  p2.fillSignin(USER);
});

describe('User create a movie', () => {
  it.skip('should login, open the movie title form, and add a movie', () => {
    const p1 = new LoginViewPage();
    const p2: MovieCreatePage = p1.clickSigninWithNoMovies();

    // Create a movie
    const p4: MovieTitleFormModal = p2.clickAddMovie();
    p4.fillMovieName(MOVIES_CYTEST[0]);
    const p5: MovieEditablePage = p4.clickCreate();
    p5.assertMovieTitleExists(MOVIES_CYTEST[0])
  });
});

describe('User create and update another movie', () => {
  it.skip('should login, open the movie title form, add movie, then update it', () => {
    const p1 = new LoginViewPage();
    const p2: MovieListPage = p1.clickSigninWithMovies();

    // Assert movie from previous test exists
    p2.assertMovieExists(MOVIES_CYTEST[0])

    // Create a movie
    const p3: MovieTitleFormModal = p2.clickAddMovie();
    p3.fillMovieName(MOVIES_CYTEST[1]);
    p3.clickCreate();

    // Let God Bruce do it
  });
});

describe('User delete two movies', () => {
  it.skip('should login, delete two movies, then assert that they are deleted', () => {
    const p1 = new LoginViewPage();
    const p2: MovieListPage = p1.clickSigninWithMovies();

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
