/// <reference types="cypress" />

import { HomePage, SearchPage, ViewPage, WishlistPage } from '../../support/pages/marketplace';
import { User, USER } from '@blockframes/e2e/fixtures/users';
import { clearDataAndPrepareTest, signIn } from '@blockframes/e2e/utils/functions';

const BINGE_WATCH_COUNT = 5;
const MOVIE_LIST1_COUNT = 3;

const userFixture = new User();
const users  =  [ userFixture.getByUID(USER.Vincent) ];

beforeEach(() => {
  clearDataAndPrepareTest();
  signIn(users[0]);
});

describe('Test wishlist features from library, detail page',  () => {
  it.only('User logs in, (dis)likes from library page, verifies wishlist.', () => {
    const p1 = new HomePage();
    const p3: SearchPage = p1.clickViewTheLibrary();
    const p4: WishlistPage = p3.clickWishlist();
    cy.get('catalog-wishlist', {timeout: 3000});
    cy.wait(5000);
    cy.log('Clear WatchList');
    p4.removeMovieFromWishlist();
    cy.go('back');

    p3.clearAllFilters('All films');
    cy.wait(8000);

    let movieViewCount = BINGE_WATCH_COUNT;

    p3.getAllMovies(movieViewCount);
    cy.get('@movieList').then(x => {
      const watchList: string[] = x as any;
      movieViewCount = watchList.length;

      //1. Create a list of movies to test.
      let movieList1 = watchList;
      movieList1 = watchList.slice(0, MOVIE_LIST1_COUNT);
      let likedCount = movieList1.length;
      const movieList2 = watchList.slice(likedCount - 1, watchList.length);

      //2. Add movies to wishlist
      cy.log(`A: Updating WishList: [${JSON.stringify(movieList1)}]`);
      movieList1.forEach(movieName => {
        p3.clickWishlistButton(movieName);
        cy.wait(2000);
      });

      //3. Verify list
      p3.clickWishlist();
      cy.wait(5000);
      movieList1.forEach(movieName => {
        p4.assertMovieInCurrentWishlist(movieName);
      });
      cy.log(`Checking WishList count: [${movieList1.length}] | A`);
      p4.checkWishListCount(movieList1.length);


      //4. let movieList2 = []
      cy.go('back');
      cy.log(`B: Updating WishList: [${JSON.stringify(movieList2)}]`);
      movieList2.forEach(movieName => {
        p3.clearAllFilters('All films');
        cy.wait(5000);
        const p5: ViewPage = p3.selectMovie(movieName);
        p5.clickWishListButton();
        p5.openSideNav();
        p5.clickLibrary();
      });

      // one movie got removed from likes.
      likedCount +=  (BINGE_WATCH_COUNT - MOVIE_LIST1_COUNT) - 1;

      //5. Remove a movie from Line view
      p3.clearAllFilters('All films');
      cy.wait(8000);
      cy.log(`C: Dropping from WishList: [${movieList2[1]}]`);
      p3.clickWishlistButton(movieList2[1]);
      likedCount -= 1;

      //6. Verify movie counts
      cy.log(`Checking WishList count: [${likedCount}] | C`);
      p3.checkWishListCount(likedCount);
    })
  });
});
