/// <reference types="cypress" />

import { signInAndNavigateToMain } from "../../support/utils/utils";
import { TunnelMainPage, TunnelChainOfTitlesPage } from "../../support/pages/dashboard";
import TunnelFilesPage from "../../support/pages/dashboard/TunnelFilesPage";
import { clearDataAndPrepareTest, createFakeScript, randomID } from "@blockframes/e2e/utils/functions";

const NAVIGATION = ['Media', 'Files & Links'];
const LINKS = [
  'https://www.promo_reel.com',
  'https://www.screener_link.com',
  'https://www.youtube.com/watch?v=n22yzBmr5sY',
  'https://www.teaser.com'
];

beforeEach(() => {
  clearDataAndPrepareTest();
  signInAndNavigateToMain();
});

describe('User can navigate to the movie tunnel page 11, complete the fields, and navigate to page 12', () => {
  it('Login into an existing account, navigate on files and links page, complete the fields, go on movie tunnel page 12', () => {
    const p1 = new TunnelMainPage();
    p1.navigateToTunnelPage(NAVIGATION[0], NAVIGATION[1]);
    const p2 = new TunnelFilesPage();

    // Upload files
    createFakeScript(`${randomID()}`)
    .then(path => p2.uploadPresentationDeck(path))
    .then(() => p2.assertPresentationDeckHasUploadSucceeded());

    createFakeScript(`${randomID()}`)
    .then(path => p2.uploadScenario(path))
    .then(() => p2.assertScenarioHasUploadSucceeded());

    // File links
    p2.fillPromoReelLink(LINKS[0]);
    p2.assertPromoReelLinkExists(LINKS[0]);
    p2.fillScreenerLink(LINKS[1]);
    p2.assertScreenerLinkExists(LINKS[1]);
    p2.fillTrailerLink(LINKS[2]);
    p2.assertTrailerLinkExists(LINKS[2]);
    p2.fillPitchTeaserLink(LINKS[3]);
    p2.assertPitchTeaserLinkExists(LINKS[3]);

    // GO to movie-tunnel-12
    const p3: TunnelChainOfTitlesPage = p2.clickNext();
  });
});
