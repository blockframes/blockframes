/// <reference types="cypress" />

import { WelcomeViewPage, LoginViewPage } from "../../support/pages/auth";
import { HomePage } from "../../support/pages/marketplace";
import { User } from "../../support/utils/type";
import { USERS } from "../../support/utils/users";
import { TunnelValuationPage, TunnelSummaryPage } from "../../support/pages/dashboard";

// Select user: cytest@blockframes.com
const LOGIN_CREDENTIALS: Partial<User> = USERS[0];

const VALUATION = 'B';

const MOVIE_ID = 'P5ErzmOtap9ju9X8rWvd'; // Empty movie

beforeEach(() => {
  cy.clearCookies();
  cy.clearLocalStorage();
  cy.visit('/auth');
  cy.viewport('ipad-2', 'landscape');
});

describe('User can navigate to the movie tunnel page 13, complete the field, and navigate to page 14', () => {
  it.skip('Login into an existing account, navigate on valuation page, complete the field, go on movie tunnel page 14', () => {
    // Connexion
    const p1: WelcomeViewPage = new WelcomeViewPage();
    const p2: LoginViewPage = p1.clickCallToAction();
    p2.switchMode();
    p2.fillSignin(LOGIN_CREDENTIALS);
    const p3: HomePage = p2.clickSignIn();

    // Navigate to movie-tunnel-13 and fill the field
    const p4: TunnelValuationPage = TunnelValuationPage.navigateToPage(MOVIE_ID);

    p4.selectValuation(VALUATION);
    p4.assertValuationIsSelected(VALUATION);

    // GO to movie-tunnel-13
    const p5: TunnelSummaryPage = p4.clickNext();
  });
});
