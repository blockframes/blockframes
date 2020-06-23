import { createFakeScript, randomID } from "@blockframes/e2e/utils/functions";
import { TunnelChainOfTitlesPage, TunnelFilesPage } from "../pages/dashboard";

export const FILES_LINKS = [
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
  p1.fillPromoReelLink(FILES_LINKS[0]);
  p1.assertPromoReelLinkExists(FILES_LINKS[0]);
  p1.fillScreenerLink(FILES_LINKS[1]);
  p1.assertScreenerLinkExists(FILES_LINKS[1]);
  p1.fillTrailerLink(FILES_LINKS[2]);
  p1.assertTrailerLinkExists(FILES_LINKS[2]);
  p1.fillPitchTeaserLink(FILES_LINKS[3]);
  p1.assertPitchTeaserLinkExists(FILES_LINKS[3]);

  // GO to tunnel chain of titles page
  const p2: TunnelChainOfTitlesPage = p1.clickNext();
};
