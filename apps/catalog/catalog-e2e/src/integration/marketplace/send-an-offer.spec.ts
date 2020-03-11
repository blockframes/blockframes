/// <reference types="cypress" />

import { HomePage, WishlistPage, SearchPage } from '../../support/pages/marketplace';
import { User } from '../../support/utils/type';
import { USERS } from '../../support/utils/users';
import { MOVIES } from '../../support/utils/movies';
import { LoginViewPage, WelcomeViewPage } from '../../support/pages/auth';

// Select user: wayne.massey@hart-caldwell.fake.cascade8.com
const LOGIN_CREDENTIALS: Partial<User> = USERS[2];

const MOVIENAMELIST: string[] = MOVIES.map(movie => movie.title.international);

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
    p4.openSideNav()
    const p5: SearchPage = p4.clickLibrary();

    MOVIENAMELIST.forEach(movieName => {
      p5.clickWishlistButton(movieName);
    });

    // Go to wishlist and submit to sellers
    const p6: WishlistPage = p5.clickWishlist();

    // Verify current wishlist
    MOVIENAMELIST.forEach(movieName => {
      p6.assertMovieInCurrentWishlist(movieName);
    });

    // Send the current wishlist
    p6.clickSendToSellers();

    // Verify sent wishlist
    p6.assertNoCurrentWishlist();
    MOVIENAMELIST.forEach(movieName => {
      p6.assertMovieInSentWishlist(movieName);
    });
  });
});
