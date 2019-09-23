import NavbarPage from '../NavbarPage';

export default class MovieEditablePage extends NavbarPage {
  public static FIELD_INTERNATIONAL_TITLE = 'internationalTitle'
  public static FIELD_DIRECTORS = 'directors';
  public static FIELD_PRODUCTION_YEAR = 'productionYear';

  public static OPTION_TYPES = 'types';
  public static OPTION_GENRES = 'genres';
  public static OPTION_ORIGIN_COUNTRIES = 'originCountries';
  public static OPTION_PRODUCER_COUNTRY = 'coProducerCountries';
  public static OPTION_LANGUAGES = 'languages';
  public static OPTION_STATUS = 'status';

  constructor() {
    super();
    cy.get('[page-id=movie-editable]', {timeout: 10000});
  }

  public assertMovieTitleExists(movieName: string) {
    cy.get('[page-id=movie-form-main] input[test-id=movie-add]').should(input => {
      expect(input.val()).to.contain(movieName);
    });
  }
}
