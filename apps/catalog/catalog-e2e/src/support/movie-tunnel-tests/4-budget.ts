import { TunnelTechnicalInfoPage, TunnelBudgetPage } from "../pages/dashboard";

const BUDGET_RANGE = 'Less than $1 million';
const QUOTAS = ['EOF'];
const COUNTRIES = ['Japan', 'France'];
const PARTIAL_COUNTRIES = ['jap', 'fr'];
const METRIC = 'admissions';
const EARNING = '120000';
const RATING = 'Tous publics';
const JOURNAL_NAME = 'NY Times';
const REVUE_LINK = 'https://www.nytimes.com/2007/10/24/movies/24lage.html';
const CRITIC = '“Lagerfeld Confidential,” an intimate portrait of the designer who has ruled the House of Chanel for more than two decades.';

export const budgetTest = () => {
  const p1 = new TunnelBudgetPage();

  // Budget Range
  p1.selectBudgetRange(BUDGET_RANGE);
  p1.assertBudgetRangeIsSelected(BUDGET_RANGE);

  // Box office
  p1.fillBoxOfficeCountry(PARTIAL_COUNTRIES[0]);
  p1.selectBoxOfficeCountry(COUNTRIES[0]);
  p1.assertBoxOfficeCountryExists(COUNTRIES[0]);
  p1.clickSelectMetric();
  p1.selectMetric(METRIC);
  p1.assertMetricExists(METRIC);
  p1.fillBoxOfficeEarnings(EARNING);
  p1.assertBoxOfficeEarningsExists(EARNING);

  // Qualifications
  QUOTAS.forEach(QUOTA => {
    p1.selectQuota(QUOTA);
    p1.assertQuotaIsSelected(QUOTA);
  });

  // Ratings
  p1.fillRatingsCountry(PARTIAL_COUNTRIES[1]);
  p1.selectRatingsCountry(COUNTRIES[1]);
  p1.assertRatingsCountry(COUNTRIES[1]);
  p1.fillRating(RATING);
  p1.assertRatingExists(RATING);

  // Film Reviews
  p1.fillJournalName(JOURNAL_NAME);
  p1.assertJournalNameExists(JOURNAL_NAME);
  p1.fillRevueLink(REVUE_LINK);
  p1.assertRevueLinkExists(REVUE_LINK);
  p1.fillFilmCritic(CRITIC);
  p1.assertFilmCriticExists(CRITIC);

  // GO to movie tunnel technical info page
  const p2: TunnelTechnicalInfoPage = p1.clickNext();
};
