/// <reference types="cypress" />

import { WelcomeViewPage, LoginViewPage } from "../../support/pages/auth";
import { HomePage } from "../../support/pages/marketplace";
import { User } from "../../support/utils/type";
import { USERS } from "../../support/utils/users";
import { TunnelMainPage } from "../../support/pages/dashboard";

// Select user: cytest@blockframes.com
const LOGIN_CREDENTIALS: Partial<User> = USERS[0];

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
    p4.selectContentType('TV Film');
    p4.assertContentTypeExists('TV Film');
    p4.clickFreshness();
    p4.selectFreshness('Library');
    p4.assertFreshnessExists('Library');
  });
});
