import { createFakeScript, randomID } from "@blockframes/e2e/utils/functions";
import { TunnelChainOfTitlesPage, TunnelFilesPage } from "../pages/dashboard";

const LINKS = [
  'https://www.promo_reel.com',
  'https://www.screener_link.com',
  'https://www.youtube.com/watch?v=n22yzBmr5sY',
  'https://www.teaser.com'
];

export const filesTest = () => {
  const p1 = new TunnelFilesPage();

  // Upload files
  createFakeScript(`${randomID()}`)
  .then(path => p1.uploadPresentationDeck(path))
  .then(() => p1.assertPresentationDeckHasUploadSucceeded());

  createFakeScript(`${randomID()}`)
  .then(path => p1.uploadScenario(path))
  .then(() => p1.assertScenarioHasUploadSucceeded());

  // File links
  p1.fillPromoReelLink(LINKS[0]);
  p1.assertPromoReelLinkExists(LINKS[0]);
  p1.fillScreenerLink(LINKS[1]);
  p1.assertScreenerLinkExists(LINKS[1]);
  p1.fillTrailerLink(LINKS[2]);
  p1.assertTrailerLinkExists(LINKS[2]);
  p1.fillPitchTeaserLink(LINKS[3]);
  p1.assertPitchTeaserLinkExists(LINKS[3]);

  // GO to tunnel chain of titles page
  const p2: TunnelChainOfTitlesPage = p1.clickNext();
};
