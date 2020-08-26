import { TunnelSummaryPage } from "../pages/dashboard";

// Tests variables
import { CONTENT_TYPES, DIRECTORS, MAIN_COUNTRIES, MEDIA, MAIN_LANGUAGES, GENRE, CAST_MEMBERS, FESTIVALS, AWARDS, PREMIERE, YEAR } from "./1-main";
import { KEYWORDS, SYNOPSIS, KEY_ASSETS } from "./2-storyline";
import { PRODUCTION_YEAR, STAKEHOLDERS, CREDITS_COUNTRIES, PRODUCERS, CREDITS_ROLES, CREW_MEMBERS } from "./3-credits";
import { BUDGET_RANGE, BUDGET_COUNTRIES, RATING, QUOTAS, CRITIC } from "./4-budget";
import { INFO_FORMATS, INFO_LANGUAGE } from "./5-technical-info";
import { FILES_LINKS } from "./7-files";
import { VALUATION } from "./9-valuation";
// Change cause of difference of typo
const TV_FILM = 'Tv Film';
const RUNTIME = '1h 27m';
const DATE = '10/10/07';
const SUBTITLED = 'Subtitled';
const EARNING = '120,000';

export const summaryTest = () => {
  const p1 = new TunnelSummaryPage();

  // 1-Main
  p1.assertMainFields([TV_FILM, CONTENT_TYPES[1], CONTENT_TYPES[2], CONTENT_TYPES[3], CONTENT_TYPES[4]]);
  p1.assertMainFields(DIRECTORS);
  p1.assertCountriesOfOriginFields([MAIN_COUNTRIES[0], MEDIA, DATE]);
  p1.assertMainInformation(MAIN_LANGUAGES);
  p1.assertMainInformation([GENRE, RUNTIME]);
  p1.assertSalesCast(CAST_MEMBERS);
  p1.assertFestivalPrizes(FESTIVALS);
  p1.assertFestivalPrizes(AWARDS);
  p1.assertFestivalPrizes([PREMIERE, YEAR]);

  // 2-Storyline
  p1.assertStoryline([SYNOPSIS, KEY_ASSETS]);
  p1.assertStoryline(KEYWORDS);

  // 3-Credits
  p1.assertCredit([PRODUCTION_YEAR, CREDITS_ROLES[0]]);
  p1.assertCredit(STAKEHOLDERS);
  p1.assertCredit(CREDITS_COUNTRIES);
  p1.assertCredit(PRODUCERS);
  p1.assertCredit(CREW_MEMBERS);

  // Budget
  p1.assertBudget([BUDGET_RANGE, EARNING, RATING, CRITIC]);
  p1.assertBudget(BUDGET_COUNTRIES);
  p1.assertBudget(QUOTAS);

  // Technical info
  p1.assertTechnicalInfo(INFO_FORMATS);
  p1.assertTechnicalInfo([INFO_LANGUAGE, SUBTITLED]);

  // Promotional images
  // TODO: create promotional images verification

  // Files and links
  p1.assertLinks(FILES_LINKS);

  // Evaluation
  p1.assertEvaluation(VALUATION);

  // Save the movie
  p1.clickSave();
};
