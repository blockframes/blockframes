export default class SearchPage {

  constructor() {
    cy.get('[page-id=catalog-search]');
  }

  public fillProductionYear(from: string, to: string) {
    cy.get('[page-id=catalog-search] [test-id=production-year-panel]').click();
    cy.get('[page-id=catalog-search] input[test-id=production-year-input-from]').type(from);
    cy.get('[page-id=catalog-search] input[test-id=production-year-input-to]').type(to);
  }

  public selectGenres(genre: string) {
    cy.get('[page-id=catalog-search] [test-id=genres-panel]').click();
    cy.get('[page-id=catalog-search] mat-checkbox').contains(genre).click();
  }

  public selectLanguages(language: string) {
    cy.get('[page-id=catalog-search] [test-id=languages-panel]').click();
    cy.get('[page-id=catalog-search] input[test-id=languages-panel-input]').type(language);
    cy.get('mat-option').contains(language).click();
    cy.get('[page-id=catalog-search] mat-checkbox').contains('Original').click();
    cy.get('[page-id=catalog-search] button[test-id=languages]').click();
  }

  public selectCertifications() {
    cy.get('[page-id=catalog-search] [test-id=certifications-panel]').click();
    cy.get('[page-id=catalog-search] mat-checkbox').contains('EOF').click();
  }

  public selectAvailabilities() {
    cy.get('[page-id=catalog-search] [test-id=availabilities-panel]').click();
    cy.get('[test-id=datepicker-from]').click();
    cy.get('[aria-label=2019]').click();
    cy.get('[aria-label="September 2019"]').click();
    cy.get('[aria-label="September 1, 2019"]').click();
    cy.get('[test-id=datepicker-to]').click();
    cy.get('[aria-label=2019]').click();
    cy.get('[aria-label="September 2019"]').click();
    cy.get('[aria-label="September 10, 2019"]').click();
  }
}

