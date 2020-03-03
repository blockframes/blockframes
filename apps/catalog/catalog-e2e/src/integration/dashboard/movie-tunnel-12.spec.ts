/// <reference types="cypress" />

import { clearDataAndPrepareTest, signInAndNavigateToMain } from "../../support/utils/utils";
import { TunnelMainPage, TunnelChainOfTitlesPage } from "../../support/pages/dashboard";

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
    .then(path => p2.uploadPresentationDeck(path))
    .then(() => p2.assertPresentationDeckHasUploadStatus((UPLOAD_STATUS)));

    // GO to movie-tunnel-12
    //const p3: TunnelChainOfTitlesPage = p2.clickNext();
  });
});
