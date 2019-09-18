import HomePage from "./HomePage";
import NavbarPage from './NavbarPage';
import OrganizationFormPage from "./OrganizationFormPage";

export default class MovieEditPage extends NavbarPage {
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
    cy.get('[page-id=movie-edit]', {timeout: 10000});
  }

  public clickHome() {
    cy.get('button[testId=home]').click({force: true});
    return new HomePage();
  }

  public clickSaveMovie() {
    cy.get('button[testId=saveMovie]').click({force: true});
  }

  public assertMovieTitleExists(movieName: string) {
    cy.get('[page-id=movie-form-main] input[test-id=movie-add]').should(input => {
      expect(input.val()).to.contain(movieName);
    });
  }

  public assertInputAndViewValueExists(controlName: string, value: string) {
    cy.get('mat-card').contains(value);
    cy.get(`input[formControlName=${controlName}]`).should(input => {
      expect(input.val()).to.contain(value);
    })
  }

  public fillInputValue(controlName: string, value: string) {
    cy.get(`input[formControlName=${controlName}]`).type(value);
  }

  public selectOptions(controlName: string, values: string[]) {
    cy.get(`mat-select[formControlName=${controlName}]`).click();
    values.forEach(value => cy.get(`mat-option[ng-reflect-value=${value}]`).scrollIntoView().click({force: true}));
  }

  public assertOptionsExist(values: string[]) {
    values.forEach(value => {
      value = value[0].toLocaleUpperCase() + value.substring(1);
      cy.get('mat-card').contains(value);
    });
  }

  public clickOnOrganization() {
    return new OrganizationFormPage();
  }
}
