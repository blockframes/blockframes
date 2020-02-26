/// <reference types="cypress" />

import { TunnelDistributionRightPage, TunnelStorylinePage } from '../../support/pages/dashboard';
import { HomePage } from '../../support/pages/marketplace';
import { User } from '../../support/utils/type';
import { USERS } from '../../support/utils/users';
import { LoginViewPage, WelcomeViewPage } from '../../support/pages/auth';

// TEST

// Select user: cytest@blockframes.com
const LOGIN_CREDENTIALS: Partial<User> = USERS[0];

const KEYWORDS = ['Karl Lagerfeld', 'Fashion'];

const MOVIE_ID = 'P5ErzmOtap9ju9X8rWvd'; // Empty movie

beforeEach(() => {
  cy.clearCookies();
  cy.clearLocalStorage();
  cy.visit('/auth');
  cy.viewport('ipad-2', 'landscape');
});

describe('User can navigate to the movie tunnel page 3, complete the field, and navigate to page 4', () => {
  it.skip('Login into an existing account, navigate on keywords page, complete the field keywords, go on movie tunnel page 4', () => {
    // Connexion
    const p1: WelcomeViewPage = new WelcomeViewPage();
    const p2: LoginViewPage = p1.clickCallToAction();
    p2.switchMode();
    p2.fillSignin(LOGIN_CREDENTIALS);
    const p3: HomePage = p2.clickSignIn();

    // Navigate to movie-tunnel-3 and fill storyline inputs
    const p4: TunnelStorylinePage = TunnelStorylinePage.navigateToPage(MOVIE_ID);

    // Synopsis
    p4.fillSynopsis('An up-close-and-personal portrait of the fashion icon, Karl Lagerfeld.');
    p4.assertSynopsisExists('An up-close-and-personal portrait of the fashion icon, Karl Lagerfeld.');

    // Key Assets
    p4.fillKeyAssets('One of the few films presenting Karl Lagerfeld.');
    p4.assertKeyAssetsExists('One of the few films presenting Karl Lagerfeld.');

    // Keywords
    KEYWORDS.forEach(KEYWORD => {
      p4.fillKeyword(KEYWORD);
      p4.fillComma();
      p4.assertMatChipExists(KEYWORD);
    });

    // Go to movie-tunnel-4
    const p5: TunnelDistributionRightPage = p4.clickNext();
  });
});
