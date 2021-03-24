/// <reference types="cypress" />

import { LandingPage } from '../../support/pages/landing';
import { HomePage, SearchPage, ViewPage, DistributionPage, SelectionPage } from '../../support/pages/marketplace';
import { Availabilities } from '@blockframes/e2e/utils/type';
import { AuthLoginPage } from '@blockframes/e2e/pages/auth';
import { clearDataAndPrepareTest } from '@blockframes/e2e/utils/functions';
import { User, USER } from '@blockframes/e2e/fixtures/users';
import { SEC } from "@blockframes/e2e/utils/env";

const userFixture = new User();
const user = userFixture.getByUID(USER.Camilla);

// SearchPage
const PRODUCTION_YEAR = { from: '2000', to: '2004'};
const GENRE_ARRAY = ['Romance', 'Drama'];
const LANGUAGE = 'English';
const CERTIFICATIONS = 'EOF'
const AVAILAILITIES: Availabilities = {
  yearFrom: '2019',
  monthFrom: 'September',
  dayFrom: '1',
  yearTo: '2019',
  monthTo: 'September',
  dayTo: '10'
}
const TERRITORIES = 'World';
const SEARCH_MEDIA_ARRAY = ['Pay TV', 'Free TV'];
// ViewPage
const MOVIE_NAME = 'Eternal Sunshine of the Spotless Mind';
// DistributionPage
const DISTRIBUTION_DATES = { from: '1', to: '10'};
const DISTRIBUTION_TERRITORY = 'World';
const DISTRIBUTION_MEDIA_ARRAY = ['pay-tv', 'free-tv'];

beforeEach(() => {
  clearDataAndPrepareTest('/');
  const p1 = new LandingPage();
  const p2 = p1.clickLogin();
  p2.fillSignin(user);
  p2.clickSignIn();
});

describe('test select movie from catalog', () => {
  it.skip('login into an existing account, go to movie catalog, search movie, create distribution rights, add distribution rights', () => {
    // Connexion
    const p2: AuthLoginPage = new AuthLoginPage();
    p2.fillSignin(user);
    p2.clickSignIn();
    const p3 = new HomePage();
    // Go to search page and apply filters
    const p4: SearchPage = p3.clickViewTheLibrary();
    p4.selectGenres(GENRE_ARRAY);
    p4.selectLanguages(LANGUAGE);
    p4.selectAvailabilities(AVAILAILITIES);
    p4.selectTerritories(TERRITORIES);
    p4.selectMandateMedias(SEARCH_MEDIA_ARRAY);
    // select one movie
    const p5: ViewPage = p4.selectMovie(MOVIE_NAME);
    // create distribution right for one movie
    const p6: DistributionPage = p5.clickDistributionDeals();
    p6.selectDates(DISTRIBUTION_DATES);
    p6.selectTerritory(DISTRIBUTION_TERRITORY);
    p6.selectMedias(DISTRIBUTION_MEDIA_ARRAY);
    p6.selectLanguage();
    p6.clickDistributionSearch();
    // select distribution rights from table and make offer
    const p7: SelectionPage = p6.clickAddDistribution();
    p7.fillOffer();
    p7.selectCurrency();
  });
});

describe('Create a new bucket', () => {
  it('Log in, go to the library page and add movie to the bucket', () => {
    const p1 = new HomePage();
    p1.openSidenavMenuAndNavigate('library');
    const p2 = new SearchPage();
    cy.wait(3 * SEC);
    p2.fillAvailFilter();
    // p2.addToBucket('A Perfect Enemy');
    p1.openSidenavMenuAndNavigate('selection');
  });
});
