import { TunnelTechnicalInfoPage, TunnelPromotionalImagesPage } from "../pages/dashboard";

const FORMATS = ['1.66', 'SD', 'Color', 'Dolby SR'];
const PARTIAL_LANGUAGE = 'en';
const LANGUAGE = 'English';

export const technicalInfoTest = () => {
  const p1 = new TunnelTechnicalInfoPage();

  // Format
  p1.selectShootingFormat(FORMATS[0]);
  p1.assertShootingFormatIsSelected(FORMATS[0]);
  p1.selectFormatQuality(FORMATS[1]);
  p1.assertFormatQualityIsSelected(FORMATS[1]);
  p1.selectColor(FORMATS[2]);
  p1.assertColorIsSelected(FORMATS[2]);
  p1.selectSoundQuality(FORMATS[3]);
  p1.assertSoundQualityIsSelected(FORMATS[3]);

  // Available Versions
  p1.selectLanguage(PARTIAL_LANGUAGE, LANGUAGE);
  p1.assertLanguageExists(LANGUAGE);
  p1.checkSubtitled();
  p1.assertSubtitledIsChecked();

  const p2: TunnelPromotionalImagesPage = p1.clickNext();
};
