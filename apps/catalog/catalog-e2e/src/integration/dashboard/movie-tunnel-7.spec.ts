/// <reference types="cypress" />

import { TunnelDistributionRightPage, TunnelKeywordsPage } from '../../support/pages/dashboard';
import { HomePage } from '../../support/pages/marketplace';
import { User } from '../../support/utils/type';
import { USERS } from '../../support/utils/users';
import { LoginViewPage, WelcomeViewPage } from '../../support/pages/auth';

// TEST

// Select user: cytest@blockframes.com
const LOGIN_CREDENTIALS: Partial<User> = USERS[0];

const KEYWORDS = ['Karl Lagerfeld', 'Fashion'];

beforeEach(() => {
  cy.clearCookies();
  cy.clearLocalStorage();
  cy.visit('/auth');
  cy.viewport('ipad-2', 'landscape');
});

describe('User can navigate to the movie tunnel page 7, complete the field, and navigate to page 8', () => {
  it.skip('Login into an existing account, navigate on keywords page, complete the field keywords, go on movie tunnel page 8', () => {
    // Connexion
    const p1: WelcomeViewPage = new WelcomeViewPage();
    const p2: LoginViewPage = p1.clickCallToAction();
    p2.switchMode();
    p2.fillSignin(LOGIN_CREDENTIALS);
    const p3: HomePage = p2.clickSignIn();

    // Navigate to movie-tunnel-7 and fill keywords input
    const p4: TunnelKeywordsPage = TunnelKeywordsPage.navigateToPage();
    KEYWORDS.forEach(KEYWORD => {
      p4.fillKeyword(KEYWORD);
      p4.fillComma();
      p4.assertMatChipExists(KEYWORD);
    });

    // Go to movie-tunnel-8
    const p5: TunnelDistributionRightPage = p4.clickNext();
  });
});
