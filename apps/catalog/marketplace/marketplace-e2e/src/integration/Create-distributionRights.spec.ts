/// <reference types="cypress" />

import { LandingPage, LoginPage, HomePage, SearchPage, ViewPage, DistributionPage, SelectionPage, FeedbackPage } from '../support/pages';
import { User, Availabilities } from "../support/utils/type";

const LOGIN_CREDENTIALS: Partial<User> = {
  email: 'hello2@cascade8.com',
  password: 'blockframes'
};
const GENRE_ARRAY = ['Romance', 'Drama'];
const PRODUCTION_YEAR = { from: '2000', to: '2004'};
const SEARCH_MEDIA_ARRAY = ['Pay TV', 'Free TV'];
const DISTRIBUTION_MEDIA_ARRAY = ['pay-tv', 'free-tv']; // key.slug
const Availabilities: Partial<Availabilities> = {
  yearFrom: '2019',
  monthFrom: 'September',
  dayFrom: '1',
  yearTo: '2019',
  monthTo: 'September',
  dayTo: '10'
}
const movieName = 'Eternal Sunshine of the Spotless Mind';

beforeEach(() => {
  cy.clearCookies();
  cy.clearLocalStorage();
  cy.visit('/auth');
  cy.viewport('ipad-2', 'landscape');

});

describe('test select movie from catalog', () => {
  it('login into an existing account, go to movie catalog, search movie, create distribution rights, add distribution rights', () => {
    const p1: LandingPage = new LandingPage();
    const p2: LoginPage = p1.clickCallToAction();
    p2.fillSignin(LOGIN_CREDENTIALS);
    const p3: HomePage = p2.clickSignIn();
    const p4: SearchPage = p3.clickDiscover();
    p4.fillProductionYear(PRODUCTION_YEAR);
    p4.selectGenres(GENRE_ARRAY);
    p4.selectLanguages('English');
    p4.selectCertifications('EOF');
    p4.selectAvailabilities(Availabilities);
    p4.selectTerritories('World');
    p4.selectMandateMedias(SEARCH_MEDIA_ARRAY);
    const p5: ViewPage = p4.selectMovie(movieName);
    const p6: DistributionPage = p5.clickDistributionRights();
    p6.selectDates();
    p6.selectTerritory();
    p6.selectMedias(DISTRIBUTION_MEDIA_ARRAY);
    p6.selectLanguage();
    p6.clickDistributionSearch();
    const p7: SelectionPage = p6.clickAddDistribution();
    p7.fillOffer();
    p7.selectCurrency();
    const p8: FeedbackPage = p7.clickSend();
    p8.clickRedirect();
    p3.openProfileMenu();
    p3.clickLogout();
  });
});
