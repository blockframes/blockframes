/// <reference types="cypress" />

import { TunnelBudgetPage, TunnelTechnicalInfoPage, TunnelMainPage } from '../../support/pages/dashboard';
import { signInAndNavigateToMain } from '../../support/utils/utils';
import { clearDataAndPrepareTest } from '@blockframes/e2e/utils/functions';

// TEST

const NAVIGATION = ['Title Information', 'Budget, Quotas, Critics'];

const BUDGET_RANGE = 'Less than $1 million';
const QUOTAS = ['EOF'];
const COUNTRIES = ['Japan', 'France'];
const PARTIAL_COUNTRIES = ['jap', 'fr'];
const METRIC = '#Admissions';
const EARNING = '120000';
const RATING = 'Tous publics';
const JOURNAL_NAME = 'NY Times';
const REVUE_LINK = 'https://www.nytimes.com/2007/10/24/movies/24lage.html';
const CRITIC = '“Lagerfeld Confidential,” an intimate portrait of the designer who has ruled the House of Chanel for more than two decades.';

beforeEach(() => {
  clearDataAndPrepareTest();
  signInAndNavigateToMain();
});

describe('User can navigate to the movie tunnel budget page, complete the fields, and navigate to technical info page', () => {
  it('Login into an existing account, navigate on budget page, complete budget and quotas fields, go on movie tunnel technical info page', () => {
    const p1 = new TunnelMainPage();
    p1.navigateToTunnelPage(NAVIGATION[0], NAVIGATION[1]);
    const p2 = new TunnelBudgetPage();

    // Budget Range
    p2.selectBudgetRange(BUDGET_RANGE);
    p2.assertBudgetRangeIsSelected(BUDGET_RANGE);

    // Box office
    p2.fillBoxOfficeCountry(PARTIAL_COUNTRIES[0]);
    p2.selectBoxOfficeCountry(COUNTRIES[0]);
    p2.assertBoxOfficeCountryExists(COUNTRIES[0]);
    p2.clickSelectMetric();
    p2.selectMetric(METRIC);
    p2.assertMetricExists(METRIC);
    p2.fillBoxOfficeEarnings(EARNING);
    p2.assertBoxOfficeEarningsExists(EARNING);

    // Qualifications
    QUOTAS.forEach(QUOTA => {
      p2.selectQuota(QUOTA);
      p2.assertQuotaIsSelected(QUOTA);
    });

    // Ratings
    p2.fillRatingsCountry(PARTIAL_COUNTRIES[1]);
    p2.selectRatingsCountry(COUNTRIES[1]);
    p2.assertRatingsCountry(COUNTRIES[1]);
    p2.fillRating(RATING);
    p2.assertRatingExists(RATING);

    // Film Reviews
    p2.fillJournalName(JOURNAL_NAME);
    p2.assertJournalNameExists(JOURNAL_NAME);
    p2.fillRevueLink(REVUE_LINK);
    p2.assertRevueLinkExists(REVUE_LINK);
    p2.fillFilmCritic(CRITIC);
    p2.assertFilmCriticExists(CRITIC);

    // GO to movie tunnel technical info page
    const p3: TunnelTechnicalInfoPage = p2.clickNext();
  });
});
