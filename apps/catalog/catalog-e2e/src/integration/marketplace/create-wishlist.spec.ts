/// <reference types="cypress" />

import { HomePage, SearchPage, ViewPage, WishlistPage } from '../../support/pages/marketplace';
import { LandingPage } from '../../support/pages/landing';
import { User } from '@blockframes/e2e/utils/type';
import { USERS } from '@blockframes/e2e/utils/users';
import { MOVIES } from '@blockframes/e2e/utils/movies';
import { LoginViewPage } from '@blockframes/e2e/pages/auth';

// Select user: wayne.massey@hart-caldwell.fake.cascade8.com
const LOGIN_CREDENTIALS: Partial<User> = USERS[2];

const MOVIENAMELIST: string[] = MOVIES.map(movie => movie.title.international);

beforeEach(() => {
  cy.clearCookies();
  cy.clearLocalStorage();
  cy.visit('/');
  cy.viewport('ipad-2', 'landscape');
  const p1: LandingPage = new LandingPage();
  p1.clickLogin();
});

describe('Test wishlist icon from library page', () => {
  it.skip('Login into an existing account, add two movies on wishlist from library page, check the wishlist.', () => {
    // Connexion
    const p1: LoginViewPage = new LoginViewPage();
    p1.fillSignin(LOGIN_CREDENTIALS);
    p1.clickSignIn();
    const p2 = new HomePage();

    // Add two movies to the wishlist
    const p3: SearchPage = p2.clickViewTheLibrary();
    MOVIENAMELIST.forEach(movieName => {
      p3.clickWishlistButton(movieName);
    });

    // Go to wishlist and verify movies are here
    const p4: WishlistPage = p3.clickWishlist();
    MOVIENAMELIST.forEach(movieName => {
      p4.assertMovieInCurrentWishlist(movieName);
    });
    p4.checkWishListCount(MOVIENAMELIST.length);

    // Remove movies from the current wishlist
    MOVIENAMELIST.forEach(movieName => {
      p4.removeMovieFromWishlist(movieName);
    });

    // Check that current wishlist is empty
    p4.assertNoMovieInWishlist();
    p4.assertNoWishListCount(MOVIENAMELIST.length);
  });
});

describe('Test wishlist icon from movie view page', () => {
  it.skip('Login into an existing account, add two movies on wishlist from their view page, check the wishlist.', () => {
    // Connexion
    const p1: LoginViewPage = new LoginViewPage();
    p1.fillSignin(LOGIN_CREDENTIALS);
    p1.clickSignIn();
    const p2 = new HomePage();

    // Add two movies to the wishlist
    const p3: SearchPage = p2.clickViewTheLibrary();
    MOVIENAMELIST.forEach(movieName => {
      const p4: ViewPage = p3.selectMovie(movieName);
      p4.clickWishListButton();
      p4.openSideNav();
      p4.clickLibrary();
    });

    // Go to wishlist and verify movies are here
    const p5: WishlistPage = p3.clickWishlist();
    MOVIENAMELIST.forEach(movieName => {
      p5.assertMovieInCurrentWishlist(movieName);
    });
    p5.checkWishListCount(MOVIENAMELIST.length);

    // Remove movies from the current wishlist
    MOVIENAMELIST.forEach(movieName => {
      p5.removeMovieFromWishlist(movieName);
    });

    // Check that current wishlist is empty
    p5.assertNoMovieInWishlist();
    p5.assertNoWishListCount(MOVIENAMELIST.length);
  });

  describe('Test wishlist removal icon from everywhere', () => {
    it.skip(`Login into an existing account, add and remove a movie from home page, add and remove
      two movies from their view page and add and remove two movies from line-up page.`, () => {
      // Connexion
      const p1: LoginViewPage = new LoginViewPage();
      p1.fillSignin(LOGIN_CREDENTIALS);
      p1.clickSignIn();
      const p2 = new HomePage();

      // HOME PAGE

      // Add and remove a movie with wishlist button from home page
      p2.clickFirstWishlistButton();
      p2.assertWishListCountIsOne();
      p2.clickFirstWishlistButton();
      p2.assertNoWishListCount(MOVIENAMELIST.length);

      // VIEW PAGE

      // Add two movies from view page
      const p3: SearchPage = p2.clickViewTheLibrary();
      MOVIENAMELIST.forEach(movieName => {
        const p4: ViewPage = p3.selectMovie(movieName);
        p4.clickWishListButton();
        p4.openSideNav();
        p4.clickLibrary();
      });
      p3.checkWishListCount(MOVIENAMELIST.length);

      // Remove two movies from view page
      MOVIENAMELIST.forEach(movieName => {
        const p4: ViewPage = p3.selectMovie(movieName);
        p4.clickWishListButton();
        p4.openSideNav();
        p4.clickLibrary();
      });
      p3.assertNoWishListCount(MOVIENAMELIST.length);

      // LINE-UP PAGE

      // Add two movies from line-up page
      MOVIENAMELIST.forEach(movieName => {
        p3.clickWishlistButton(movieName);
      });
      p3.checkWishListCount(MOVIENAMELIST.length);

      // Remove two movies from line-up page
      MOVIENAMELIST.forEach(movieName => {
        p3.clickWishlistButton(movieName);
      });
      p3.assertNoWishListCount(MOVIENAMELIST.length);
    });
  });
});
