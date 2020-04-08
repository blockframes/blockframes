/// <reference types="cypress" />

import { TunnelValuationPage, TunnelSummaryPage, TunnelMainPage } from "../../support/pages/dashboard";
import { signInAndNavigateToMain } from "../../support/utils/utils";
import { clearDataAndPrepareTest } from "@blockframes/e2e/utils/functions";

const NAVIGATION = ['Legal Information', 'Marketplace Eval.'];

const VALUATION = 'B';

beforeEach(() => {
  clearDataAndPrepareTest();
  signInAndNavigateToMain();
});

describe('User can navigate to the movie tunnel valuation page, complete the field, and navigate to summary page', () => {
  it('Login into an existing account, navigate on valuation page, complete the field, go on movie tunnel summary page', () => {
    const p1 = new TunnelMainPage();
    p1.navigateToTunnelPage(NAVIGATION[0], NAVIGATION[1]);
    const p2 = new TunnelValuationPage();

    p2.selectValuation(VALUATION);
    p2.assertValuationIsSelected(VALUATION);

    // GO to movie tunnel summary page
    const p3: TunnelSummaryPage = p2.clickNext();
  });
});
