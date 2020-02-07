/// <reference types="cypress" />

import { HomePage, WishlistPage } from '../../support/pages/marketplace';
import { User } from '../../support/utils/type';
import { USERS } from '../../support/utils/users';
import { MOVIENAMELIST } from '../../support/utils/movies';
import { LoginViewPage, WelcomeViewPage } from '../../support/pages/auth';

// Select user: cytest@blockframes.com
const LOGIN_CREDENTIALS: Partial<User> = USERS[0];

beforeEach(() => {
  cy.clearCookies();
  cy.clearLocalStorage();
  cy.visit('/auth');
  cy.viewport('ipad-2', 'landscape');
});

describe('Test submit wishlist to sellers', () => {
  it.skip('Login into an existing account, verify if the current wishlist is empty, add movies to current wishlist from the home page, send wishlist to sellers.', () => {
    // Connexion
    const p1: WelcomeViewPage = new WelcomeViewPage();
    const p2: LoginViewPage = p1.clickCallToAction();
    p2.switchMode();
    p2.fillSignin(LOGIN_CREDENTIALS);
    const p3: HomePage = p2.clickSignIn();

    // Go to wishlist
    const p4: WishlistPage = p3.clickWishlist();
    p4.assertNoCurrentWishlist();

    // Go to home page and add movies to the current wishlist
    const p5: HomePage = p4.clickContextMenuHome();
    p5.clickWishlistButton(MOVIENAMELIST[0]);
    p5.clickWishlistButton(MOVIENAMELIST[1]);

    // Go to wishlist and submit to sellers
    const p6: WishlistPage = p5.clickWishlist();

    // Verify current wishlist
    p6.assertMovieInCurrentWishlist(MOVIENAMELIST[0]);
    p6.assertMovieInCurrentWishlist(MOVIENAMELIST[1]);

    // Send the current wishlist
    p6.clickSendToSellers();

    // Verify sent wishlist
    p6.assertNoCurrentWishlist();
    p6.assertMovieInSentWishlist(MOVIENAMELIST[0]);
    p6.assertMovieInSentWishlist(MOVIENAMELIST[1]);
  });
});
