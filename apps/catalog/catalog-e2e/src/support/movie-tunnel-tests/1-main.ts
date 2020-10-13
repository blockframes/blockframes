import { TunnelMainPage, TunnelStorylinePage } from "../pages/dashboard";

export const CONTENT_TYPES = ['TV Film', 'Completed', 'Lagerfeld Confidential', 'Lagerfeld Confidentiel', 'Lagerfeld'];
export const DIRECTORS = ['Rodolphe', 'Marconi', 'Ceci est mon corps (2001)'];
export const MAIN_PARTIAL_COUNTRIES = ['Fr', 'Pl', 'It'];
export const MAIN_COUNTRIES = ['France', 'Poland', 'Italy'];
export const MEDIA = 'Pay TV';
export const DATE = '10/10/2007';
export const DISTRIBUTORS = ['Caroline de Monaco', 'Monica Bellucci'];
export const MAIN_PARTIAL_LANGUAGES = ['fr', 'en'];
export const MAIN_LANGUAGES = ['French', 'English'];
export const GENRE = 'Documentary';
export const RUNTIME = '87';
export const CAST_MEMBERS = ['Karl', 'Lagerfeld', 'Nicole', 'Kidman'];
export const MAIN_ROLES = ['Lead Role', 'Secondary Role'];
export const FESTIVALS = ['Berlin Film Festival', 'Zurich Film Festival'];
export const AWARDS = ['Opening Film', 'Nominee Best New Documentary Film'];
export const PREMIERE = 'World';
export const YEAR = '2007';

export const mainTest = () => {
  const p1 = new TunnelMainPage();

  // Content Type
  p1.clickContentType();
  p1.selectContentType(CONTENT_TYPES[0]);
  p1.assertContentTypeExists(CONTENT_TYPES[0]);
  p1.clickProductionStatus();
  p1.selectProductionStatus(CONTENT_TYPES[1]);
  p1.assertProductionStatusExists(CONTENT_TYPES[1]);
  p1.fillInternationalTitle(CONTENT_TYPES[2]);
  p1.assertInternationalTitleExists(CONTENT_TYPES[2]);
  p1.fillOriginalTitle(CONTENT_TYPES[3]);
  p1.assertOriginalTitleExists(CONTENT_TYPES[3]);
  p1.fillReference(CONTENT_TYPES[4]);
  p1.assertReferenceExists(CONTENT_TYPES[4]);

  // Director
  p1.fillDirectorFirstName(DIRECTORS[0]);
  p1.assertDirectorFirstNameExists(DIRECTORS[0]);
  p1.fillDirectorLastName(DIRECTORS[1]);
  p1.assertDirectorLastNameExists(DIRECTORS[1]);
  p1.fillDirectorFilmography(DIRECTORS[2]);
  p1.assertDirectorFilmographyExists(DIRECTORS[2]);

  // Country of origin
  p1.selectCountry(MAIN_PARTIAL_COUNTRIES[0], MAIN_COUNTRIES[0]);
  p1.assertCountryIsSelected(MAIN_COUNTRIES[0]);
  p1.selectMedia(MEDIA);
  p1.assertMediaIsSelected(MEDIA);
  p1.fillCountryDate(DATE);
  p1.assertCountryDateExists(DATE);

  // Distributor
  p1.fillFirstDistributorName(DISTRIBUTORS[0]);
  p1.assertFirstDestributorNameExists(DISTRIBUTORS[0]);
  p1.fillFirstDistributorCountry(MAIN_PARTIAL_COUNTRIES[1]);
  p1.selectFirstDistributorCountry(MAIN_COUNTRIES[1]);
  p1.assertFirstDistributorCountryExists(MAIN_COUNTRIES[1]);
  p1.clickAddDistributor();
  p1.fillLastDistributorName(DISTRIBUTORS[1]);
  p1.assertLastDestributorNameExists(DISTRIBUTORS[1]);
  p1.fillLastDistributorCountry(MAIN_PARTIAL_COUNTRIES[2]);
  p1.selectLastDistributorCountry(MAIN_COUNTRIES[2]);
  p1.assertLastDistributorCountryExists(MAIN_COUNTRIES[2]);

  // Original Language
  p1.fillFirstOriginalLanguage(MAIN_PARTIAL_LANGUAGES[0], MAIN_LANGUAGES[0]);
  p1.assertFirstOriginalLanguageExists(MAIN_LANGUAGES[0]);
  p1.addOriginalLanguage();
  p1.fillLastOriginalLanguage(MAIN_PARTIAL_LANGUAGES[1], MAIN_LANGUAGES[1]);
  p1.assertLastOriginalLanguageExists(MAIN_LANGUAGES[1]);

  // Genre
  p1.selectGenre(GENRE);
  p1.assertGenreExists(GENRE);

  // Runtime
  p1.fillRuntime(RUNTIME);
  p1.assertRuntimeExists(RUNTIME);

  // Principal Cast Members
  p1.fillFirstPrincipalCastCastFirstName(CAST_MEMBERS[0]);
  p1.assertFirstPrincipalCastCastFirstNameExists(CAST_MEMBERS[0]);
  p1.fillFirstPrincipalCastCastLastName(CAST_MEMBERS[1]);
  p1.assertFirstPrincipalCastCastLastNameExists(CAST_MEMBERS[1]);
  p1.clickSelectFirstPrincipalCastCastRole();
  p1.selectPrincipalCastCastRole(MAIN_ROLES[0]);
  p1.assertFirstPrincipalCastCastRoleExists(MAIN_ROLES[0]);
  p1.clickAddPrincipalCastCast();
  p1.fillLastPrincipalCastCastFirstName(CAST_MEMBERS[2]);
  p1.assertLastPrincipalCastCastFirstNameExists(CAST_MEMBERS[2]);
  p1.fillLastPrincipalCastCastLastName(CAST_MEMBERS[3]);
  p1.assertLastPrincipalCastCastLastNameExists(CAST_MEMBERS[3]);
  p1.clickSelectLastPrincipalCastCastRole();
  p1.selectPrincipalCastCastRole(MAIN_ROLES[1]);
  p1.assertLastPrincipalCastCastRoleExists(MAIN_ROLES[1]);

  // Festival
  p1.fillFirstFestivalName(FESTIVALS[0]);
  p1.assertFirstFestivalNameExists(FESTIVALS[0]);
  p1.fillFirstFestivalAwardSelection(AWARDS[0]);
  p1.assertFirstFestivalAwardSelectionExists(AWARDS[0]);
  p1.fillFirstFestivalYear(YEAR);
  p1.assertFirstFestivalYearExists(YEAR);
  p1.selectFirstFestivalPremiere(PREMIERE);
  p1.assertFirstFestivalPremiereIsSelected(PREMIERE);
  p1.addFestival();
  p1.fillLastFestivalName(FESTIVALS[1]);
  p1.assertLastFestivalNameExists(FESTIVALS[1]);
  p1.fillLastFestivalAwardSelection(AWARDS[1]);
  p1.assertLastFestivalAwardSelectionExists(AWARDS[1]);
  p1.fillLastFestivalYear(YEAR);
  p1.assertLastFestivalYearExists(YEAR);

  // Go to tunnel storyline page
  const p2: TunnelStorylinePage = p1.clickNext();
};
