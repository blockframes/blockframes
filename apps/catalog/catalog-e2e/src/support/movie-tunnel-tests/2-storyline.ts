import { TunnelStorylinePage, TunnelCreditsPage } from "../pages/dashboard";

export const KEYWORDS = ['Karl Lagerfeld', 'Fashion'];
export const SYNOPSIS = 'An up-close-and-personal portrait of the fashion icon, Karl Lagerfeld.';
export const KEY_ASSETS = 'One of the few films presenting Karl Lagerfeld.';

export const storylineTest = () => {
  const p1 = new TunnelStorylinePage();

  // Synopsis
  p1.fillSynopsis(SYNOPSIS);
  p1.assertSynopsisExists(SYNOPSIS);

  // Key Assets
  p1.fillKeyAssets(KEY_ASSETS);
  p1.assertKeyAssetsExists(KEY_ASSETS);

  // Keywords
  KEYWORDS.forEach(KEYWORD => {
    p1.fillKeyword(KEYWORD);
    p1.fillComma();
    p1.assertMatChipExists(KEYWORD);
  });

  // Go to movie tunnel credits page
  const p2: TunnelCreditsPage = p1.clickNext();
};
