/// <reference types="cypress" />

import { signInAndNavigateToMain } from "../../support/utils/utils";
import { TunnelMainPage, TunnelStorylinePage, TunnelCreditsPage, TunnelSummaryPage, TitlesDetailsPage, TitlesListPage, TitlesActivityPage } from "../../support/pages/dashboard";
import { clearDataAndPrepareTest } from "@blockframes/e2e/utils/functions";

const NAVIGATION = ['Summary', 'Summary & Submission'];
const PRODUCTION_STATUS = 'Completed';
const TITLES = ['Lagerfeld Confidential', 'Lagerfeld Confidentiel'];
const DIRECTORS = ['Rodolphe', 'Marconi'];
const PARTIAL_COUNTRIE = 'Fr';
const COUNTRIE = 'France';
const PARTIAL_LANGUAGE = 'fr';
const LANGUAGE = 'French';
const GENRE = 'Documentary';
const RUNTIME = '87';
const SYNOPSIS = 'An up-close-and-personal portrait of the fashion icon, Karl Lagerfeld.';
const PRODUCTION_YEAR = '2006';

beforeEach(() => {
  clearDataAndPrepareTest('/');
  signInAndNavigateToMain();
});

//TODO: Issue: #3874 
// Need new movie form for Catalog App to rewrite the tests.
describe.skip('User can navigate to the movie tunnel, complete required fields, and send the movie', () => {
  it('Login into an existing account, navigate on movie tunnel, complete required fields, go on titles page, navigate to movie page', () => {

    // Fill main required fields
    const p1 = new TunnelMainPage();
    p1.clickProductionStatus()
    p1.selectProductionStatus(PRODUCTION_STATUS);
    p1.fillInternationalTitle(TITLES[0]);
    p1.fillOriginalTitle(TITLES[1]);
    p1.fillDirectorFirstName(DIRECTORS[0]);
    p1.fillDirectorLastName(DIRECTORS[1]);
    p1.selectCountry(PARTIAL_COUNTRIE, COUNTRIE);
    p1.fillFirstOriginalLanguage(PARTIAL_LANGUAGE, LANGUAGE);
    p1.selectGenre(GENRE);
    p1.assertGenreExists(GENRE);
    p1.fillRuntime(RUNTIME);
    p1.assertRuntimeExists(RUNTIME);

    const p2: TunnelStorylinePage = p1.clickNext();
    p2.fillSynopsis(SYNOPSIS);

    const p3: TunnelCreditsPage = p2.clickNext();
    p3.fillProductionYear(PRODUCTION_YEAR);

    // Go on summary page
    p3.navigateToTunnelPage(NAVIGATION[0], NAVIGATION[1]);
    const p4 = new TunnelSummaryPage();

    // Submit movie and go on TitlesDetailsPage
    const p5: TitlesDetailsPage = p4.clickSubmit();
    p5.assertTitleExists(TITLES[0]);

    // Go on TitlesListPage
    const p6: TitlesListPage = p5.clickTitles();

    // Go on TitlesActivityPage
    p6.clickLastPageTable();
    const p7: TitlesActivityPage = p6.clickMovieLigne(TITLES[0]);
    p7.assertTitleExists(TITLES[0]);
  });
});
