/// <reference types="cypress" />

import { LoginViewPage, WelcomeViewPage, HomePage, WishlistPage, SearchPage, ViewPage } from "../support/pages";
import { User } from "../support/utils/type";
import { USERS } from "../support/utils/users";
import { MOVIENAMELIST } from "../support/utils/movies";

// Select user: cytest.thejokers@blockframes.com
const LOGIN_CREDENTIALS: Partial<User> = USERS[1];

const REMOVE_MESSAGE = ' has been removed from your selection.'
const ADD_MESSAGE = ' has been added to your selection.'

beforeEach(() => {
  cy.clearCookies();
  cy.clearLocalStorage();
  cy.visit('/auth');
  cy.viewport('ipad-2', 'landscape');
});

describe('Test wishlist icon from line-up page', () => {
  it('Login into an existing account, add two movies on wishlist from line-up page, check the wishlist.', () => {
    // Connexion
    const p1: WelcomeViewPage = new WelcomeViewPage();
    const p2: LoginViewPage = p1.clickCallToAction();
    p2.switchMode();
    p2.fillSignin(LOGIN_CREDENTIALS);
    const p3: HomePage = p2.clickSignIn();

    // Add two movies to the wishlist
    const p4: SearchPage = p3.clickContextMenuLineUp();
    MOVIENAMELIST.forEach(movieName => {
      p4.addMovieToWishlist(movieName);
      p5.checkMessage(movieName + ADD_MESSAGE);
    });

    // Go to wishlist and verify movies are here
    const p5: WishlistPage = p4.clickWishlist();
    MOVIENAMELIST.forEach(movieName => {
      p5.assertMovieInCurrentWishlist(movieName);
    })
    p5.checkWishListCount(MOVIENAMELIST.length);

    // Remove movies from the current wishlist
    MOVIENAMELIST.forEach(movieName => {
      p5.removeMovieFromWishlist(movieName);
      p5.checkMessage(movieName + REMOVE_MESSAGE);
    })

    // Check that current wishlist is empty
    p5.assertNoMovieInWishlist();
    p5.checkWishListCount(0);
  });
});

describe('Test wishlist icon from movie view page', () => {
  it('Login into an existing account, add two movies on wishlist from their view page, check the wishlist.', () => {
    // Connexion
    const p1: WelcomeViewPage = new WelcomeViewPage();
    const p2: LoginViewPage = p1.clickCallToAction();
    p2.switchMode();
    p2.fillSignin(LOGIN_CREDENTIALS);
    const p3: HomePage = p2.clickSignIn();

    // Add two movies to the wishlist
    const p4: SearchPage = p3.clickContextMenuLineUp();
    MOVIENAMELIST.forEach(movieName => {
      const p5: ViewPage = p4.selectMovie(movieName);
      p5.addMovieToWishlist();
      p5.checkMessage(movieName + ADD_MESSAGE);
      p5.clickContextMenuLineUp();
    });

    // Go to wishlist and verify movies are here
    const p6: WishlistPage = p4.clickWishlist();
    MOVIENAMELIST.forEach(movieName => {
      p6.assertMovieInCurrentWishlist(movieName);
    })
    p6.checkWishListCount(MOVIENAMELIST.length);

    // Remove movies from the current wishlist
    MOVIENAMELIST.forEach(movieName => {
      p6.removeMovieFromWishlist(movieName);
      p6.checkMessage(movieName + REMOVE_MESSAGE);
    })

    // Check that current wishlist is empty
    p6.assertNoMovieInWishlist();
    p6.checkWishListCount(0);
  });

  describe('Test wishlist removal icon from everywhere', () => {
    it(`Login into an existing account, add and remove two movies from home page, add and remove
    two movies from their view page and add and remove two movies from line-up page.`, () => {
      // Connexion
      const p1: WelcomeViewPage = new WelcomeViewPage();
      const p2: LoginViewPage = p1.clickCallToAction();
      p2.switchMode();
      p2.fillSignin(LOGIN_CREDENTIALS);
      const p3: HomePage = p2.clickSignIn();

      // HOME PAGE

      // Add two movies from home page
      MOVIENAMELIST.forEach(movieName => {
        p3.addMovieToWishlist(movieName);
      });
      p3.checkWishListCount(MOVIENAMELIST.length);

      // Remove two movies from home page
      MOVIENAMELIST.forEach(movieName => {
        p3.addMovieToWishlist(movieName);
      });
      p3.checkWishListCount(0);

      // VIEW PAGE

      // Add two movies from view page
      const p4: SearchPage = p3.clickContextMenuLineUp();
      MOVIENAMELIST.forEach(movieName => {
        const p5: ViewPage = p4.selectMovie(movieName);
        p5.addMovieToWishlist();
        p5.clickContextMenuLineUp();
      });
      p4.checkWishListCount(MOVIENAMELIST.length);

      // Remove two movies from view page
      MOVIENAMELIST.forEach(movieName => {
        const p5: ViewPage = p4.selectMovie(movieName);
        p5.addMovieToWishlist();
        p5.clickContextMenuLineUp();
      });
      p4.checkWishListCount(0);

      // LINE-UP PAGE

      // Add two movies from line-up page
      MOVIENAMELIST.forEach(movieName => {
        p4.addMovieToWishlist(movieName);
      });
      p4.checkWishListCount(MOVIENAMELIST.length);

      // Remove two movies from line-up page
      MOVIENAMELIST.forEach(movieName => {
        p4.addMovieToWishlist(movieName);
      });
      p4.checkWishListCount(0);
    });
  })

});
