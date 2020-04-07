/// <reference types="cypress" />

import { TunnelStorylinePage, TunnelMainPage, TunnelCreditsPage } from '../../support/pages/dashboard';
import { signInAndNavigateToMain } from '../../support/utils/utils';
import { clearDataAndPrepareTest } from '@blockframes/e2e/utils/functions';

// TEST
const NAVIGATION = ['Title Information', 'Storyline Elements'];
const KEYWORDS = ['Karl Lagerfeld', 'Fashion'];

beforeEach(() => {
  clearDataAndPrepareTest();
  signInAndNavigateToMain();
});

describe('User can navigate to the movie tunnel storyline page, complete the field, and navigate to credits page', () => {
  it('Login into an existing account, navigate on storyline page, complete the field keywords, go on movie tunnel credits page', () => {
    const p1 = new TunnelMainPage();
    p1.navigateToTunnelPage(NAVIGATION[0], NAVIGATION[1]);
    const p2 = new TunnelStorylinePage();

    // Synopsis
    p2.fillSynopsis('An up-close-and-personal portrait of the fashion icon, Karl Lagerfeld.');
    p2.assertSynopsisExists('An up-close-and-personal portrait of the fashion icon, Karl Lagerfeld.');

    // Key Assets
    p2.fillKeyAssets('One of the few films presenting Karl Lagerfeld.');
    p2.assertKeyAssetsExists('One of the few films presenting Karl Lagerfeld.');

    // Keywords
    KEYWORDS.forEach(KEYWORD => {
      p2.fillKeyword(KEYWORD);
      p2.fillComma();
      p2.assertMatChipExists(KEYWORD);
    });

    // Go to movie tunnel credits page
    const p3: TunnelCreditsPage = p2.clickNext();
  });
});
