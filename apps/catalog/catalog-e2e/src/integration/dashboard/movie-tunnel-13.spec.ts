/// <reference types="cypress" />

import { TunnelValuationPage, TunnelSummaryPage, TunnelMainPage } from "../../support/pages/dashboard";
import { signInAndNavigateToMain, clearDataAndPrepareTest } from "../../support/utils/utils";

const NAVIGATION = ['Legal Information', 'Marketplace Eval.'];

const VALUATION = 'B';

beforeEach(() => {
  clearDataAndPrepareTest();
  signInAndNavigateToMain();
});

describe('User can navigate to the movie tunnel page 13, complete the field, and navigate to page 14', () => {
  it('Login into an existing account, navigate on valuation page, complete the field, go on movie tunnel page 14', () => {
    const p1 = new TunnelMainPage();
    p1.navigateToTunnelPage(NAVIGATION[0], NAVIGATION[1]);
    const p2 = new TunnelValuationPage();

    p2.selectValuation(VALUATION);
    p2.assertValuationIsSelected(VALUATION);

    // GO to movie-tunnel-13
    const p3: TunnelSummaryPage = p2.clickNext();
  });
});
