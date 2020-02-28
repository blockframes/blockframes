/// <reference types="cypress" />

import { TunnelBudgetPage, TunnelTechnicalInfoPage } from '../../support/pages/dashboard';
import { HomePage } from '../../support/pages/marketplace';
import { User } from '../../support/utils/type';
import { USERS } from '../../support/utils/users';
import { LoginViewPage, WelcomeViewPage } from '../../support/pages/auth';

// TEST

// Select user: cytest@blockframes.com
const LOGIN_CREDENTIALS: Partial<User> = USERS[0];

const BUDGET_RANGE = 'Less than $1 million';
const QUOTAS = ['EOF', 'European'];
const COUNTRIES = ['Japan', 'France'];
const PARTIAL_COUNTRIES = ['jap', 'fr'];
const METRIC = '#Entrances';
const EARNING = '120000';
const RATING = 'Tous publics';
const JOURNAL_NAME = 'NY Times';
const REVUE_LINK = 'https://www.nytimes.com/2007/10/24/movies/24lage.html';
const CRITIC = '“Lagerfeld Confidential,” an intimate portrait of the designer who has ruled the House of Chanel for more than two decades.';

const MOVIE_ID = 'P5ErzmOtap9ju9X8rWvd'; // Empty movie

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
    const p4: TunnelBudgetPage = TunnelBudgetPage.navigateToPage(MOVIE_ID);

    // Budget Range
    p4.selectBudgetRange(BUDGET_RANGE);
    p4.assertBudgetRangeIsSelected(BUDGET_RANGE);

    // Box office
    p4.fillBoxOfficeCountry(PARTIAL_COUNTRIES[0]);
    p4.selectBoxOfficeCountry(COUNTRIES[0]);
    p4.assertBoxOfficeCountryExists(COUNTRIES[0]);
    p4.clickSelectMetric();
    p4.selectMetric(METRIC);
    p4.assertMetricExists(METRIC);
    p4.fillBoxOfficeEarnings(EARNING);
    p4.assertBoxOfficeEarningsExists(EARNING);

    // Qualifications
    QUOTAS.forEach(QUOTA => {
      p4.selectQuota(QUOTA);
      p4.assertQuotaIsSelected(QUOTA);
    });

    // Ratings
    p4.fillRatingsCountry(PARTIAL_COUNTRIES[1]);
    p4.selectRatingsCountry(COUNTRIES[1]);
    p4.assertRatingsCountry(COUNTRIES[1]);
    p4.fillRating(RATING);
    p4.assertRatingExists(RATING);

    // Film Reviews
    p4.fillJournalName(JOURNAL_NAME);
    p4.assertJournalNameExists(JOURNAL_NAME);
    p4.fillRevueLink(REVUE_LINK);
    p4.assertRevueLinkExists(REVUE_LINK);
    p4.fillFilmCritic(CRITIC);
    p4.assertFilmCriticExists(CRITIC);

    // GO to movie-tunnel-6
    const p5: TunnelTechnicalInfoPage = p4.clickNext();
  });
});
