/// <reference types="cypress" />

import { signInAndNavigateToMain } from "../../support/utils/utils";
import { TunnelMainPage, TunnelChainOfTitlesPage, TunnelValuationPage } from "../../support/pages/dashboard";
import { clearDataAndPrepareTest, createFakeScript, randomID } from "@blockframes/e2e/utils/utils";

const NAVIGATION = ['Legal Information', 'Chain of Titles'];

beforeEach(() => {
  clearDataAndPrepareTest();
  signInAndNavigateToMain();
});

describe('User can navigate to the movie tunnel page 12, complete the fields, and navigate to page 13', () => {
  it('Login into an existing account, navigate on chain of titles page, complete the fields, go on movie tunnel page 13', () => {
    const p1 = new TunnelMainPage();
    p1.navigateToTunnelPage(NAVIGATION[0], NAVIGATION[1]);
    const p2 = new TunnelChainOfTitlesPage();

    createFakeScript(`${randomID()}`)
    .then(path => p2.uploadChainOfTitlesFile(path))
    .then(() => p2.assertChainOfTitlesFileHasUploadSucceeded());

    // GO to movie-tunnel-13
    const p3: TunnelValuationPage = p2.clickNext();
  });
});
