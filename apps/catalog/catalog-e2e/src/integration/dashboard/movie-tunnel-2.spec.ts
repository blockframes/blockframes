/// <reference types="cypress" />

import { WelcomeViewPage, LoginViewPage } from "../../support/pages/auth";
import { HomePage } from "../../support/pages/marketplace";
import { User } from "../../support/utils/type";
import { USERS } from "../../support/utils/users";
import { TunnelMainPage, TunnelStorylinePage } from "../../support/pages/dashboard";

// Select user: cytest@blockframes.com
const LOGIN_CREDENTIALS: Partial<User> = USERS[0];

const CONTENT_TYPES = ['TV Film', 'Library', 'Completed', 'Lagerfeld Confidential', 'Lagerfeld Confidentiel', 'Lagerfeld'];
const DIRECTORS = ['Rodolphe', 'Marconi', 'Ceci est mon corps (2001)'];
const PARTIAL_COUNTRIES = ['Fr', 'pol', 'it'];
const COUNTRIES = ['France', 'Poland', 'Italy'];
const MEDIA = 'Boat';
const DATE = '10/10/2007';
const DISTRIBUTORS = ['Caroline de Monaco', 'Monica Bellucci'];
const PARTIAL_LANGUAGES = ['fr', 'en'];
const LANGUAGES = ['French', 'English'];
const GENRE = 'Documentary';
const RUNTIME = '87';
const CAST_MEMBERS = ['Karl', 'Lagerfeld', 'Nicole', 'Kidman'];
const ROLES = ['Executive Producer', 'Associate Producer'];
const FESTIVALS = ['Berlin Film Festival', 'Zurich Film Festival'];
const AWARDS = ['Opening Film', 'Nominee Best New Documentary Film'];
const PREMIERE = 'World';
const YEAR = '2007';

const MOVIE_ID = 'P5ErzmOtap9ju9X8rWvd'; // Empty movie

beforeEach(() => {
  cy.clearCookies();
  cy.clearLocalStorage();
  cy.visit('/auth');
  cy.viewport('ipad-2', 'landscape');
});

describe('User can navigate to the movie tunnel page 2 and fill all the fieldsn and navigate to page 3', () => {
  it.skip('Login into an existing account, navigate on main page, complete main fields, go on movie tunnel page 3', () => {
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
    p4.fillDirectorFirstName(DIRECTORS[0]);
    p4.assertDirectorFirstNameExists(DIRECTORS[0]);
    p4.fillDirectorLastName(DIRECTORS[1]);
    p4.assertDirectorLastNameExists(DIRECTORS[1]);
    p4.fillDirectorFilmography(DIRECTORS[2]);
    p4.assertDirectorFilmographyExists(DIRECTORS[2]);

    // Country of origin
    p4.selectCountry(PARTIAL_COUNTRIES[0], COUNTRIES[0]);
    p4.assertCountryIsSelected(COUNTRIES[0]);
    p4.selectMedia(MEDIA);
    p4.assertMediaIsSelected(MEDIA);
    p4.fillCountryDate(DATE);
    p4.assertCountryDateExists(DATE);

    // Distributor
    p4.fillFirstDistributorName(DISTRIBUTORS[0]);
    p4.assertFirstDestributorNameExists(DISTRIBUTORS[0]);
    p4.fillFirstDistributorCountry(PARTIAL_COUNTRIES[1]);
    p4.selectFirstDistributorCountry(COUNTRIES[1]);
    p4.assertFirstDistributorCountryExists(COUNTRIES[1]);
    p4.clickAddDistributor();
    p4.fillLastDistributorName(DISTRIBUTORS[1]);
    p4.assertLastDestributorNameExists(DISTRIBUTORS[1]);
    p4.fillLastDistributorCountry(PARTIAL_COUNTRIES[2]);
    p4.selectLastDistributorCountry(COUNTRIES[2]);
    p4.assertLastDistributorCountryExists(COUNTRIES[2]);

    // Original Language
    p4.fillFirstOriginalLanguage(PARTIAL_LANGUAGES[0], LANGUAGES[0]);
    p4.assertFirstOriginalLanguageExists(LANGUAGES[0]);
    p4.addOriginalLanguage();
    p4.fillLastOriginalLanguage(PARTIAL_LANGUAGES[1], LANGUAGES[1]);
    p4.assertLastOriginalLanguageExists(LANGUAGES[1]);

    // Genre
    p4.selectGenre(GENRE);
    p4.assertGenreExists(GENRE);

    // Runtime
    p4.fillRuntime(RUNTIME);
    p4.assertRuntimeExists(RUNTIME);

    // Principal Cast Members
    p4.fillFirstPrincipalCastCastFirstName(CAST_MEMBERS[0]);
    p4.assertFirstPrincipalCastCastFirstNameExists(CAST_MEMBERS[0]);
    p4.fillFirstPrincipalCastCastLastName(CAST_MEMBERS[1]);
    p4.assertFirstPrincipalCastCastLastNameExists(CAST_MEMBERS[1]);
    p4.clickSelectFirstPrincipalCastCastRole();
    p4.selectPrincipalCastCastRole(ROLES[0]);
    p4.assertFirstPrincipalCastCastRoleExists(ROLES[0]);
    p4.clickAddPrincipalCastCast();
    p4.fillLastPrincipalCastCastFirstName(CAST_MEMBERS[2]);
    p4.assertLastPrincipalCastCastFirstNameExists(CAST_MEMBERS[2]);
    p4.fillLastPrincipalCastCastLastName(CAST_MEMBERS[3]);
    p4.assertLastPrincipalCastCastLastNameExists(CAST_MEMBERS[3]);
    p4.clickSelectLastPrincipalCastCastRole();
    p4.selectPrincipalCastCastRole(ROLES[1]);
    p4.assertLastPrincipalCastCastRoleExists(ROLES[1]);

    // Festival
    p4.fillFirstFestivalName(FESTIVALS[0]);
    p4.assertFirstFestivalNameExists(FESTIVALS[0]);
    p4.fillFirstFestivalAwardSelection(AWARDS[0]);
    p4.assertFirstFestivalAwardSelectionExists(AWARDS[0]);
    p4.fillFirstFestivalYear(YEAR);
    p4.assertFirstFestivalYearExists(YEAR);
    p4.selectFirstFestivalPremiere(PREMIERE);
    p4.assertFirstFestivalPremiereIsSelected(PREMIERE);
    p4.addFestival();
    p4.fillLastFestivalName(FESTIVALS[1]);
    p4.assertLastFestivalNameExists(FESTIVALS[1]);
    p4.fillLastFestivalAwardSelection(AWARDS[1]);
    p4.assertLastFestivalAwardSelectionExists(AWARDS[1]);
    p4.fillLastFestivalYear(YEAR);
    p4.assertLastFestivalYearExists(YEAR);

    // Go to tunnel 3
    const p5: TunnelStorylinePage = p4.clickNext();
  });
});
