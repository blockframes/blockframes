import { createFakeScript, randomID } from "@blockframes/e2e/utils/functions";
import { TunnelChainOfTitlesPage, TunnelValuationPage } from "../pages/dashboard";

export const chainOfTitlesTest = () => {
  const p1 = new TunnelChainOfTitlesPage();

  createFakeScript(`${randomID()}`)
  .then(path => p1.uploadChainOfTitlesFile(path))
  .then(() => p1.assertChainOfTitlesFileHasUploadSucceeded());

  // GO to movie tunnel valuation page
  const p2: TunnelValuationPage = p1.clickNext();
};
