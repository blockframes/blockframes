// /// <reference types="cypress" />

// import { LandingPage, HomePage, AddMovieModal, MovieEditPage } from "../support/pages";

// const INPUTS_FORM = {
//   [MovieEditPage.FIELD_INTERNATIONAL_TITLE]: 'The terminator',
//   [MovieEditPage.FIELD_DIRECTORS]: ['Bruce'],
//   [MovieEditPage.FIELD_PRODUCTION_YEAR]: '2019',
// };

// const OPTIONS_FORM = {
//   [MovieEditPage.OPTION_TYPES]: ['fiction', 'documentary'],
//   [MovieEditPage.OPTION_GENRES]: ['thriller', 'horror'],
//   [MovieEditPage.OPTION_ORIGIN_COUNTRIES]: ['france'],
//   [MovieEditPage.OPTION_PRODUCER_COUNTRY]: ['france'],
//   [MovieEditPage.OPTION_LANGUAGES]: ['french'],
//   [MovieEditPage.OPTION_STATUS]: ['shooting']
// };

// const EMAIL_CYTEST = 'cytest@blockframes.com';
// const PASSWORD_CYTEST = 'azerty';
// const ORG_CYTEST = 'cytest';
// const MOVIE_CYTEST = 'Terminator';

// beforeEach(() => {
//   cy.clearCookies();
//   cy.clearLocalStorage();
//   cy.visit('/auth');
//   cy.viewport('macbook-15');
// });

// describe('Test CRUD movie', () => {
//   it.skip('should login, create a movie, edit this movie, then delete it', () => {
//     // Connexion
//     const p1: LandingPage = new LandingPage();
//     p1.fillSigninEmail(EMAIL_CYTEST);
//     p1.fillSigninPassword(PASSWORD_CYTEST);
//     const p2: HomePage = p1.login();
//     p2.assertOrgExists(ORG_CYTEST);

//     // Create a movie
//     const p3: AddMovieModal = p2.clickAddMovie(ORG_CYTEST);
//     p3.fillMovieName(MOVIE_CYTEST);
//     const p4: MovieEditPage = p3.clickCreate();

//     // Add informations and verify the entry
//     p4.assertMovieTitleExists(MOVIE_CYTEST);
//     Object.entries(INPUTS_FORM).forEach(input => {
//       p4.fillInputValue(input[0], input[1]);
//       p4.assertInputAndViewValueExists(input[0], input[1]);
//     });
//     Object.entries(OPTIONS_FORM).forEach(option => {
//       p4.selectOptions(option[0], option[1]);
//       p4.assertOptionsExist(option[1]);
//     });
//     p4.clickSaveMovie();

//     // Go to home page and comeback to verify saved informations
//     const p5: HomePage = p4.clickHome();
//     p5.displayMovieMenu(MOVIE_CYTEST);
//     const p6: MovieEditPage = p5.clickEdit();
//     Object.entries(INPUTS_FORM).forEach(input => {
//       p6.assertInputAndViewValueExists(input[0], input[1]);
//     });
//     Object.entries(OPTIONS_FORM).forEach(option => {
//       p6.assertOptionsExist(option[1]);
//     });

//     // Go to home page and delete the movie
//     const p7: HomePage = p6.clickHome();
//     p7.displayMovieMenu(MOVIE_CYTEST);
//     p7.clickDelete();
//     p7.assertMovieNotExists(MOVIE_CYTEST);
//   });
// });
