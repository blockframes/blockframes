import { TunnelTechnicalInfoPage, TunnelPromotionalImagesPage } from "../pages/dashboard";

export const INFO_FORMATS = ['1.66', 'SD', 'Color', 'Dolby SR'];
export const INFO_PARTIAL_LANGUAGE = 'en';
export const INFO_LANGUAGE = 'English';

export const technicalInfoTest = () => {
  const p1 = new TunnelTechnicalInfoPage();

  // Format
  p1.selectShootingFormat(INFO_FORMATS[0]);
  p1.assertShootingFormatIsSelected(INFO_FORMATS[0]);
  p1.selectFormatQuality(INFO_FORMATS[1]);
  p1.assertFormatQualityIsSelected(INFO_FORMATS[1]);
  p1.selectColor(INFO_FORMATS[2]);
  p1.assertColorIsSelected(INFO_FORMATS[2]);
  p1.selectSoundQuality(INFO_FORMATS[3]);
  p1.assertSoundQualityIsSelected(INFO_FORMATS[3]);

  // Available Versions
  p1.selectLanguage(INFO_PARTIAL_LANGUAGE, INFO_LANGUAGE);
  p1.assertLanguageExists(INFO_LANGUAGE);
  p1.checkSubtitled();
  p1.assertSubtitledIsChecked();

  const p2: TunnelPromotionalImagesPage = p1.clickNext();
};
