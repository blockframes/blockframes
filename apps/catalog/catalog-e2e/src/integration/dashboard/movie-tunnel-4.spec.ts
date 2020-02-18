/// <reference types="cypress" />

import { TunnelBudgetPage, TunnelCreditsPage } from '../../support/pages/dashboard';
import { HomePage } from '../../support/pages/marketplace';
import { User } from '../../support/utils/type';
import { USERS } from '../../support/utils/users';
import { LoginViewPage, WelcomeViewPage } from '../../support/pages/auth';

// TEST

const PRODUCTION_YEAR = '2006';
const STAKEHOLDERS = ['Realitism Films', 'Backup Media'];

// Select user: cytest@blockframes.com
const LOGIN_CREDENTIALS: Partial<User> = USERS[0];

beforeEach(() => {
  cy.clearCookies();
  cy.clearLocalStorage();
  cy.visit('/auth');
  cy.viewport('ipad-2', 'landscape');
});

describe('User can navigate to the movie tunnel page 5, complete the fields, and navigate to page 6', () => {
  it.skip('Login into an existing account, navigate on budget page, complete budget and quotas fields, go on movie tunnel page 6', () => {
    // Connexion
    const p1: WelcomeViewPage = new WelcomeViewPage();
    const p2: LoginViewPage = p1.clickCallToAction();
    p2.switchMode();
    p2.fillSignin(LOGIN_CREDENTIALS);
    const p3: HomePage = p2.clickSignIn();

    // Navigate to movie-tunnel-4 and fill the fields
    const p4: TunnelCreditsPage = TunnelCreditsPage.navigateToPage();
    p4.fillProductionYear(PRODUCTION_YEAR);
    p4.assertProductionYearExists(PRODUCTION_YEAR);
    p4.fillFirstProductioncompany(STAKEHOLDERS[0]);
    p4.assertFirstProductioncompanyExists(STAKEHOLDERS[0]);

    // Go on movie-tunnel-5
    const p5: TunnelBudgetPage = p4.clickNext();
  });
});
