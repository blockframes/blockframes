/// <reference types="cypress" />

import { WelcomeViewPage, LoginViewPage } from "../../support/pages/auth";
import { HomePage } from "../../support/pages/marketplace";
import { TunnelTechnicalInfoPage } from "../../support/pages/dashboard";
import { User } from "../../support/utils/type";
import { USERS } from "../../support/utils/users";

// Select user: cytest@blockframes.com
const LOGIN_CREDENTIALS: Partial<User> = USERS[0];

const FORMATS = ['1.66', 'SD', 'Color', 'Dolby SR'];
const PARTIAL_LANGUAGE = 'en';
const LANGUAGE = 'English';

const MOVIE_ID = 'P5ErzmOtap9ju9X8rWvd'; // Empty movie

beforeEach(() => {
  cy.clearCookies();
  cy.clearLocalStorage();
  cy.visit('/auth');
  cy.viewport('ipad-2', 'landscape');
});

describe('User can navigate to the movie tunnel page 6, complete the fields, and navigate to page 7', () => {
  it.skip('Login into an existing account, navigate on technical info page, complete fields, go on movie tunnel page 7', () => {
    // Connexion
    const p1: WelcomeViewPage = new WelcomeViewPage();
    const p2: LoginViewPage = p1.clickCallToAction();
    p2.switchMode();
    p2.fillSignin(LOGIN_CREDENTIALS);
    const p3: HomePage = p2.clickSignIn();

    // Navigate to movie-tunnel-6 and fill the fields
    const p4: TunnelTechnicalInfoPage = TunnelTechnicalInfoPage.navigateToPage(MOVIE_ID);

    // Format
    p4.selectShootingFormat(FORMATS[0]);
    p4.assertShootingFormatIsSelected(FORMATS[0]);
    p4.selectFormatQuality(FORMATS[1]);
    p4.assertFormatQualityIsSelected(FORMATS[1]);
    p4.selectColor(FORMATS[2]);
    p4.assertColorIsSelected(FORMATS[2]);
    p4.selectSoundQuality(FORMATS[3]);
    p4.assertSoundQualityIsSelected(FORMATS[3]);

    // Available Versions
    p4.selectLanguage(PARTIAL_LANGUAGE, LANGUAGE);
    p4.assertLanguageExists(LANGUAGE);
    p4.checkSubtitled();
    p4.assertSubtitledIsChecked();

    // TODO: return PromotionalImagesPage
    p4.clickNext();
  });
});
