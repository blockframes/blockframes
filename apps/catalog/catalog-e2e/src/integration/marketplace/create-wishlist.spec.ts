﻿/// <reference types="cypress" />

import { HomePage, SearchPage, ViewPage, WishlistPage } from '../../support/pages/marketplace';
import { User, USER } from '@blockframes/e2e/fixtures/users';
import { acceptCookie, clearDataAndPrepareTest, signIn } from '@blockframes/e2e/utils/functions';
import { TO } from '@blockframes/e2e/utils/env';

const BINGE_WATCH_COUNT = 5;
const MOVIE_LIST1_COUNT = 3;

const userFixture = new User();
const users  =  [ userFixture.getByUID(USER.Vincent) ];

beforeEach(() => {
  clearDataAndPrepareTest();
  signIn(users[0]);
});

describe('Test wishlist features from library, detail page',  () => {
  it('User clears all movies from Wish List', () => {
    const p1 = new HomePage();
    acceptCookie();
    const p3: SearchPage = p1.clickViewTheLibrary();
    const p4: WishlistPage = p3.clickWishlist();
    cy.get('marketplace-wishlist', {timeout: TO.PAGE_LOAD});
    cy.wait(TO.THREE_SEC);
    cy.log('Clear WatchList');
    p4.getWishListCount()
    cy.get('@movieCount').then((numMovies) => {
      p4.removeMovieFromWishlist(numMovies as any);
      p4.checkWishListCount(0);
    });
  });
  
  it('User logs in, (dis)likes from library page, verifies wishlist.', () => {
    const p1 = new HomePage();
    acceptCookie();
    const p3: SearchPage = p1.clickViewTheLibrary();
    cy.wait(TO.FIFTEEN_SEC);

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
        cy.wait(TO.ONE_SEC);
      });

      //3. Verify list
      const p4: WishlistPage = p3.clickWishlist();
      cy.wait(TO.FIFTEEN_SEC);
      movieList1.forEach(movieName => {
        p4.assertMovieInCurrentWishlist(movieName);
      });
      cy.log(`Checking WishList count: [${movieList1.length}] | A`);
      p4.checkWishListCount(movieList1.length);

      //TODO : Need to refactor this to remove wait issues.
      //Issue #3089
      /*
      //4. let movieList2 = []
      cy.go('back');
      cy.wait(TO.FIFTEEN_SEC);
      cy.log(`B: Updating WishList: [${JSON.stringify(movieList2)}]`);
      movieList2.forEach(movieName => {
        const p5: ViewPage = p3.selectMovie(movieName);
        p5.clickWishListButton();
        p5.openSideNav();
        p5.clickLibrary();
        cy.wait(TO.THREE_SEC);
      });

      // one movie got removed from likes.
      likedCount +=  (BINGE_WATCH_COUNT - MOVIE_LIST1_COUNT) - 1;
      */

      //5. Remove a movie from Line view
      p4.openSideNav();
      p4.clickLibrary();
      cy.wait(TO.FIFTEEN_SEC);
      cy.log(`C: Dropping from WishList: [${movieList2[1]}]`);
      p3.clickWishlistButton(movieList2[1]);
      //TODO : need correction for step 4.
      //Issue #3089
      //likedCount -= 1;
      likedCount =  BINGE_WATCH_COUNT - 1;

      //6. Verify movie counts
      cy.log(`Checking WishList count: [${likedCount}] | C`);
      p3.checkWishListCount(likedCount);
    })
  });
});
