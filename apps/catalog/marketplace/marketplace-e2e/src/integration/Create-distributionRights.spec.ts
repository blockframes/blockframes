/// <reference types="cypress" />

import {
  DistributionPage,
  FeedbackPage,
  HomePage,
  LandingPage,
  LoginPage,
  SearchPage,
  SelectionPage,
  ViewPage
} from '../support/pages';
import { Availabilities, User } from '../support/utils/type';
import { setupForIpad } from '@blockframes/e2e';

const LOGIN_CREDENTIALS: Partial<User> = {
  email: 'hello2@cascade8.com',
  password: 'blockframes'
};
// SearchPage
const PRODUCTION_YEAR = { from: '2000', to: '2004' };
const GENRE_ARRAY = ['Romance', 'Drama'];
const LANGUAGE = 'English';
const CERTIFICATIONS = 'EOF';
const AVAILAILITIES: Availabilities = {
  yearFrom: '2019',
  monthFrom: 'September',
  dayFrom: '1',
  yearTo: '2019',
  monthTo: 'September',
  dayTo: '10'
};
const TERRITORIES = 'World';
const SEARCH_MEDIA_ARRAY = ['Pay TV', 'Free TV'];
// ViewPage
const MOVIE_NAME = 'Eternal Sunshine of the Spotless Mind';
// DistributionPage
const DISTRIBUTION_DATES = { from: '1', to: '10' };
const DISTRIBUTION_TERRITORY = 'World';
const DISTRIBUTION_MEDIA_ARRAY = ['pay-tv', 'free-tv'];

beforeEach(() => {
  setupForIpad();
});

describe('test select movie from catalog', () => {
  it.skip('login into an existing account, go to movie catalog, search movie, create distribution rights, add distribution rights', () => {
    // Connexion
    const p1: LandingPage = new LandingPage();
    const p2: LoginPage = p1.clickCallToAction();
    p2.fillSignin(LOGIN_CREDENTIALS);
    const p3: HomePage = p2.clickSignIn();
    // Go to search page and apply filters
    const p4: SearchPage = p3.clickDiscover();
    p4.fillProductionYear(PRODUCTION_YEAR);
    p4.selectGenres(GENRE_ARRAY);
    p4.selectLanguages(LANGUAGE);
    p4.selectCertifications(CERTIFICATIONS);
    p4.selectAvailabilities(AVAILAILITIES);
    p4.selectTerritories(TERRITORIES);
    p4.selectMandateMedias(SEARCH_MEDIA_ARRAY);
    // select one movie
    const p5: ViewPage = p4.selectMovie(MOVIE_NAME);
    // create distribution right for one movie
    const p6: DistributionPage = p5.clickDistributionRights();
    p6.selectDates(DISTRIBUTION_DATES);
    p6.selectTerritory(DISTRIBUTION_TERRITORY);
    p6.selectMedias(DISTRIBUTION_MEDIA_ARRAY);
    p6.selectLanguage();
    p6.clickDistributionSearch();
    // select distribution rights from table and make offer
    const p7: SelectionPage = p6.clickAddDistribution();
    p7.fillOffer();
    p7.selectCurrency();
    // send offer and go back to homepage
    const p8: FeedbackPage = p7.clickSend();
    p8.clickRedirect();
  });
});
