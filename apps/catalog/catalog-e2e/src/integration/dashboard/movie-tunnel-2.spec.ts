/// <reference types="cypress" />

import { WelcomeViewPage, LoginViewPage } from "../../support/pages/auth";
import { HomePage } from "../../support/pages/marketplace";
import { User } from "../../support/utils/type";
import { USERS } from "../../support/utils/users";
import { TunnelMainPage } from "../../support/pages/dashboard";

// Select user: cytest@blockframes.com
const LOGIN_CREDENTIALS: Partial<User> = USERS[0];

const CONTENT_TYPES = ['TV Film', 'Library', 'Completed', 'Lagerfeld Confidential', 'Lagerfeld Confidentiel', 'Lagerfeld'];

const MOVIE_ID = 'P5ErzmOtap9ju9X8rWvd'; // Empty movie

beforeEach(() => {
  cy.clearCookies();
  cy.clearLocalStorage();
  cy.visit('/auth');
  cy.viewport('ipad-2', 'landscape');
});

describe('User can navigate to the movie tunnel page 2 and fill all the fieldsn and navigate to page 3', () => {
  it('Login into an existing account, navigate on main page, complete main fields, go on movie tunnel page 3', () => {
    // Connexion
    const p1: WelcomeViewPage = new WelcomeViewPage();
    const p2: LoginViewPage = p1.clickCallToAction();
    p2.switchMode();
    p2.fillSignin(LOGIN_CREDENTIALS);
    const p3: HomePage = p2.clickSignIn();

    // Navigate to movie-tunnel-2 and fill the fields
    const p4: TunnelMainPage = TunnelMainPage.navigateToPage(MOVIE_ID);

    // Content Type
    p4.clickContentType();
    p4.selectContentType(CONTENT_TYPES[0]);
    p4.assertContentTypeExists(CONTENT_TYPES[0]);
    p4.clickFreshness();
    p4.selectFreshness(CONTENT_TYPES[1]);
    p4.assertFreshnessExists(CONTENT_TYPES[1]);
    p4.clickProductionStatus();
    p4.selectProductionStatus(CONTENT_TYPES[2]);
    p4.assertProductionStatusExists(CONTENT_TYPES[2]);
    p4.fillInternationalTitle(CONTENT_TYPES[3]);
    p4.assertInternationalTitleExists(CONTENT_TYPES[3]);
    p4.fillOriginalTitle(CONTENT_TYPES[4]);
    p4.assertOriginalTitleExists(CONTENT_TYPES[4]);
    p4.fillReference(CONTENT_TYPES[5]);
    p4.assertReferenceExists(CONTENT_TYPES[5]);

    // Director
    p4.fillDirectorFirstName('Rodolphe');
    p4.assertDirectorFirstNameExists('Rodolphe');
    p4.fillDirectorLastName('Marconi');
    p4.assertDirectorLastNameExists('Marconi');
    p4.fillDirectorFilmography('Ceci est mon corps (2001)');
    p4.assertDirectorFilmographyExists('Ceci est mon corps (2001)');

    // Country of origin
    p4.selectCountry('Fr', 'France');
    p4.assertCountryIsSelected('France');
    p4.selectMedia('Boat');
    p4.assertMediaIsSelected('Boat');
    p4.fillCountryDate('10/10/2007');
    p4.assertCountryDateExists('10/10/2007');

    // Distributor
    p4.fillFirstDistributorName('Caroline de Monaco');
    p4.assertFirstDestributorNameExists('Caroline de Monaco');
    p4.fillFirstDistributorCountry('pol');
    p4.selectFirstDistributorCountry('Poland');
    p4.assertFirstDistributorCountryExists('Poland');
    p4.clickAddDistributor();
    p4.fillLastDistributorName('Monica Bellucci');
    p4.assertLastDestributorNameExists('Monica Bellucci');
    p4.fillLastDistributorCountry('It');
    p4.selectLastDistributorCountry('Italy');
    p4.assertLastDistributorCountryExists('Italy');

    // Original Language
    p4.fillFirstOriginalLanguage('fr', 'French');
    p4.assertFirstOriginalLanguageExists('French');
    p4.addOriginalLanguage();
    p4.fillLastOriginalLanguage('en', 'English');
    p4.assertLastOriginalLanguageExists('English');

    // Festival
    p4.fillFirstFestivalName('Berlin Film Festival');
    p4.assertFirstFestivalNameExists('Berlin Film Festival');
    p4.fillFirstFestivalAwardSelection('Opening Film');
    p4.assertFirstFestivalAwardSelectionExists('Opening Film');
    p4.fillFirstFestivalYear('2007');
    p4.assertFirstFestivalYearExists('2007');
    p4.selectFirstFestivalPremiere('World');
    p4.assertFirstFestivalPremiereIsSelected('World');
    p4.addFestival();
    p4.fillLastFestivalName('Zurich Film Festival');
    p4.assertLastFestivalNameExists('Zurich Film Festival');
    p4.fillLastFestivalAwardSelection('Nominee Best New Documentary Film');
    p4.assertLastFestivalAwardSelectionExists('Nominee Best New Documentary Film');
    p4.fillLastFestivalYear('2007');
    p4.assertLastFestivalYearExists('2007');
  });
});
