/// <reference types="cypress" />

import { TunnelTechnicalInfoPage, TunnelMainPage } from "../../support/pages/dashboard";
import { signInAndNavigateToMain } from "../../support/utils/utils";
import { clearDataAndPrepareTest } from "@blockframes/e2e/utils/utils";

const NAVIGATION = ['Media', 'Technical Info.'];

const FORMATS = ['1.66', 'SD', 'Color', 'Dolby SR'];
const PARTIAL_LANGUAGE = 'en';
const LANGUAGE = 'English';

beforeEach(() => {
  clearDataAndPrepareTest();
  signInAndNavigateToMain();
});

describe('User can navigate to the movie tunnel page 6, complete the fields, and navigate to page 7', () => {
  it('Login into an existing account, navigate on technical info page, complete fields, go on movie tunnel page 7', () => {
    const p1 = new TunnelMainPage();
    p1.navigateToTunnelPage(NAVIGATION[0], NAVIGATION[1]);
    const p2 = new TunnelTechnicalInfoPage();

    // Format
    p2.selectShootingFormat(FORMATS[0]);
    p2.assertShootingFormatIsSelected(FORMATS[0]);
    p2.selectFormatQuality(FORMATS[1]);
    p2.assertFormatQualityIsSelected(FORMATS[1]);
    p2.selectColor(FORMATS[2]);
    p2.assertColorIsSelected(FORMATS[2]);
    p2.selectSoundQuality(FORMATS[3]);
    p2.assertSoundQualityIsSelected(FORMATS[3]);

    // Available Versions
    p2.selectLanguage(PARTIAL_LANGUAGE, LANGUAGE);
    p2.assertLanguageExists(LANGUAGE);
    p2.checkSubtitled();
    p2.assertSubtitledIsChecked();

    // TODO: return PromotionalImagesPage
    p2.clickNext();
  });
});
