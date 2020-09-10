/// <reference types="cypress" />

import { HomePage, SearchPage, ViewPage, WishlistPage } from '../../support/pages/marketplace';
import { User, USER } from '@blockframes/e2e/fixtures/users';
import { EVENTS } from '@blockframes/e2e/utils';
import { clearDataAndPrepareTest, signIn } from '@blockframes/e2e/utils/functions';

const userFixture = new User();
const users  =  [ userFixture.getByUID(USER.Vincent) ];

const MOVIES_LIST = [EVENTS[0].movie, EVENTS[1].movie];
const MOVIENAMELIST: string[] = MOVIES_LIST.map(movie => movie.title.international);

beforeEach(() => {
  clearDataAndPrepareTest();
  signIn(users[0]);
});

describe('Test wishlist icon from library page', () => {
  it('Login into an existing account, add two movies on wishlist from library page, check the wishlist.', () => {
    const p1 = new HomePage();
    p1.clickFirstWishlistButton();

    // Add two movies to the wishlist
    const p3: SearchPage = p1.clickViewTheLibrary();
    const p4: WishlistPage = p3.clickWishlist();
    p4.removeMovieFromWishlist();
    cy.go('back');

    p3.clearAllFilters('All films');

    MOVIENAMELIST.forEach(movieName => {
      p3.clickWishlistButton(movieName);
      cy.wait(2000);
    });

    // Go to wishlist and verify movies are here
    p3.clickWishlist();
    cy.wait(5000);
    MOVIENAMELIST.forEach(movieName => {
      p4.assertMovieInCurrentWishlist(movieName);
    });
    p4.checkWishListCount(MOVIENAMELIST.length);

    // Remove movies from the current wishlist
    // MOVIENAMELIST.forEach(movieName => {
    //   p4.removeMovieFromWishlist(movieName);
    // });
    p4.removeMovieFromWishlist(MOVIENAMELIST);

    // Check that current wishlist is empty
    p4.assertNoMovieInWishlist();
    p4.assertNoWishListCount(MOVIENAMELIST.length);
  });
});

describe('Test wishlist icon from movie view page', () => {
  it('Login into an existing account, add two movies on wishlist from their view page, check the wishlist.', () => {
    const p2 = new HomePage();

    // VIEW PAGE

    // Add movies to the wishlist form the view page
    const p3: SearchPage = p2.clickViewTheLibrary();
    p3.clearAllFilters('All films');
    MOVIENAMELIST.forEach(movieName => {
      const p4: ViewPage = p3.selectMovie(movieName);
      p4.clickWishListButton();
      p4.openSideNav();
      p4.clickLibrary();
      cy.wait(2000);
    });

    // Go to wishlist and verify movies are here
    const p5: WishlistPage = p3.clickWishlist();
    cy.wait(2000);
    MOVIENAMELIST.forEach(movieName => {
      p5.assertMovieInCurrentWishlist(movieName);
    });
    p5.checkWishListCount(MOVIENAMELIST.length);
  });

  describe('Test wishlist from home and line-up pages', () => {
    it(`Login into an existing account, add and remove a movie from home page, add and remove
    two movies from their view page and add and remove two movies from line-up page.`, () => {
      const p2 = new HomePage();

      // HOME PAGE

      // Add and remove a movie with wishlist button from home page
      cy.wait(2000);
      p2.clickFirstWishlistButton();
      p2.assertWishListCountIsOne();

      const p3: SearchPage = p2.clickViewTheLibrary();
      p3.clearAllFilters('All films');
      //cy.wait(5000);
      // LINE-UP PAGE

      // Add two movies from line-up page
      MOVIENAMELIST.forEach(movieName => {
        cy.wait(5000);
        p3.clickWishlistButton(movieName);
      });
      // Assert one movie exists in the wishlist
      p3.checkWishListCount(MOVIENAMELIST.length -1);

      // Remove two movies from line-up page
      MOVIENAMELIST.forEach(movieName => {
        cy.wait(5000);
        p3.clickWishlistButton(movieName);
      });
      // Assert one movie exists in the wishlist
      p3.checkWishListCount(MOVIENAMELIST.length - 1);
    });
  });
});
