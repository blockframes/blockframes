import { TunnelValuationPage, TunnelSummaryPage } from "../pages/dashboard";

export const VALUATION = 'B';

export const valuationTest = () => {
  const p1 = new TunnelValuationPage();
  p1.selectValuation(VALUATION);
  p1.assertValuationIsSelected(VALUATION);

  // GO to movie tunnel summary page
  const p3: TunnelSummaryPage = p1.clickNext();
};
