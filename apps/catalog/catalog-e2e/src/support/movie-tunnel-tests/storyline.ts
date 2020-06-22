import { TunnelStorylinePage, TunnelCreditsPage } from "../pages/dashboard";

const KEYWORDS = ['Karl Lagerfeld', 'Fashion'];

export const storylineTest = () => {
  const p1 = new TunnelStorylinePage();

  // Synopsis
  p1.fillSynopsis('An up-close-and-personal portrait of the fashion icon, Karl Lagerfeld.');
  p1.assertSynopsisExists('An up-close-and-personal portrait of the fashion icon, Karl Lagerfeld.');

  // Key Assets
  p1.fillKeyAssets('One of the few films presenting Karl Lagerfeld.');
  p1.assertKeyAssetsExists('One of the few films presenting Karl Lagerfeld.');

  // Keywords
  KEYWORDS.forEach(KEYWORD => {
    p1.fillKeyword(KEYWORD);
    p1.fillComma();
    p1.assertMatChipExists(KEYWORD);
  });

  // Go to movie tunnel credits page
  const p2: TunnelCreditsPage = p1.clickNext();
};
