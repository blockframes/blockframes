/// <reference types="cypress" />

import { TunnelBudgetPage, TunnelVersionInfoPage } from '../../support/pages/dashboard';
import { HomePage } from '../../support/pages/marketplace';
import { User } from '../../support/utils/type';
import { USERS } from '../../support/utils/users';
import { LoginViewPage, WelcomeViewPage } from '../../support/pages/auth';

// TEST

// Select user: cytest@blockframes.com
const LOGIN_CREDENTIALS: Partial<User> = USERS[0];

const BUDGET_RANGE = 'Less than 1 million';
const QUOTAS = ['EOF', 'European'];

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

    // Navigate to movie-tunnel-5 and fill the fields
    const p4: TunnelBudgetPage = TunnelBudgetPage.navigateToPage();
    p4.selectBudgetRange(BUDGET_RANGE);
    p4.assertBudgetRangeIsSelected(BUDGET_RANGE);

    QUOTAS.forEach(QUOTA => {
      p4.selectQuota(QUOTA);
      p4.assertQuotaIsSelected(QUOTA);
    });

    // GO to movie-tunnel-6
    const p5: TunnelVersionInfoPage = p4.clickNext();
  });
});
