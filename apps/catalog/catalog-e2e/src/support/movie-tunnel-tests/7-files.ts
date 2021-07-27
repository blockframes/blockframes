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
    .then((path: string) => p1.uploadPresentationDeck(path))
    .then(() => p1.assertPresentationDeckHasUploadSucceeded());

  createFakeScript(`${randomID()}`)
    .then((path: string) => p1.uploadScenario(path))
    .then(() => p1.assertScenarioHasUploadSucceeded());


  // GO to tunnel chain of titles page
  const p2: TunnelChainOfTitlesPage = p1.clickNext();
};
