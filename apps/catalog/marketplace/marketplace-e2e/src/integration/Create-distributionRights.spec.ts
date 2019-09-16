/// <reference types="cypress" />

import { LandingPage, LoginPage, HomePage, SearchPage } from '../support/pages';
import { User } from "../support/utils/type";

const LOGIN_CREDENTIALS: Partial<User> = {
  email: 'hello2@cascade8.com',
  password: 'blockframes'
}

beforeEach(() => {
  cy.clearCookies();
  cy.clearLocalStorage();
  cy.visit('/auth');
  cy.viewport('ipad-2', 'landscape');

});

describe('test select movie from catalog', () => {
  it('login into an existing account, go to movie catalog, search movie, create distribution rights, add distribution rights', () => {
    // Code all your tests here
    const p1: LandingPage = new LandingPage();
    const p2: LoginPage = p1.clickCallToAction();
    p2.fillSignin(LOGIN_CREDENTIALS);
    const p3: HomePage = p2.clickSignIn();
    const p4: SearchPage = p3.clickDiscover();
    p4.fillProductionYear('2000', '2004');
    p4.selectGenres('Romance');
    // GENRE_ARRAY.forEach(genre => p.selectGenre(genre)); // will check each checkbox with genres in the array
    p4.selectLanguages('English');
    p4.selectCertifications();
    p4.selectAvailabilities();
  });
});
