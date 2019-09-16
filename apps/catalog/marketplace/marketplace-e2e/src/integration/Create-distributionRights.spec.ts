/// <reference types="cypress" />

import { LandingPage, LoginPage, HomePage, SearchPage, ViewPage, DistributionPage } from '../support/pages';
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
    const GENRE_ARRAY = ['Romance', 'Drama'];
    p4.selectGenres(GENRE_ARRAY);
    p4.selectLanguages('English');
    p4.selectCertifications('EOF');
    p4.selectAvailabilities({
      yearFrom: '2019',
      monthFrom: 'September',
      dayFrom: '1',
      yearTo: '2019',
      monthTo: 'September',
      dayTo: '10'
    });
    // TODO: looping array
    // const TERRITORY_ARRAY = ['World', 'France', 'Germany']
    p4.selectTerritories('World');
    const SEARCH_MEDIA_ARRAY = ['Pay TV', 'Free TV'];
    p4.selectMandateMedias(SEARCH_MEDIA_ARRAY);
    const p5: ViewPage = p4.selectMovie();
    const p6: DistributionPage = p5.clickDistributionRights();
    p6.selectDates();
    p6.selectTerritory();
    const DISTRIBUTION_MEDIA_ARRAY = ['pay-tv', 'free-tv']; // key.slug
    p6.selectMedias(DISTRIBUTION_MEDIA_ARRAY);
    p6.selectLanguage();
    p6.clickDistributionSearch();
    p6.clickAddDistribution();
  });
});
