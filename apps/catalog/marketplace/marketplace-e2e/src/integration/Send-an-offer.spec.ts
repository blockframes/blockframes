/// <reference types="cypress" />

import { LoginPage, LandingPage, HomePage, WishlistPage, SearchPage } from "../support/pages";
import { User } from "../support/utils/type";
import { USERS } from "../support/utils/users";

// Select user: hello@cascade8.com
const LOGIN_CREDENTIALS: Partial<User> = USERS[17];

const MOVIE_1 = 'A Perfect Enemy';
const MOVIE_2 = 'Cosmogony';

beforeEach(() => {
  cy.clearCookies();
  cy.clearLocalStorage();
  cy.visit('/auth');
  cy.viewport('ipad-2', 'landscape');
});

describe('Test submit wishlist to sellers', () => {
  it('Login into an existing account, verify if the current wishlist is empty, add movies to current wishlist, send wishlist to sellers.', () => {
    // Connexion
    const p1: LandingPage = new LandingPage();
    const p2: LoginPage = p1.clickCallToAction();
    p2.switchMode();
    p2.fillSignin(LOGIN_CREDENTIALS);
    const p3: HomePage = p2.clickSignIn();

    // Go to wishlist
    const p4: WishlistPage = p3.clickWishlist();
    p4.assertNoCurrentWishlist();

    // Go to line-up and add movies to the current wishlist
    const p5: SearchPage = p4.clickContextMenuLineUp();
    p5.addMovieToWishlist(MOVIE_1);
    p5.addMovieToWishlist(MOVIE_2);

    // Go to wishlist and submit to sellers
    const p6: WishlistPage = p5.clickWishlist();

    // Verify current wishlist
    p6.assertMovieInCurrentWishlist(MOVIE_1);
    p6.assertMovieInCurrentWishlist(MOVIE_2);

    // Send the current wishlist
    p6.clickSendToSellers();

    // Verify sent wishlist
    p6.assertNoCurrentWishlist();
    p6.assertMovieInSentWishlist(MOVIE_1);
    p6.assertMovieInSentWishlist(MOVIE_2);
  });
});
