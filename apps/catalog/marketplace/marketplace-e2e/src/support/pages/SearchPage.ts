export default class SearchPage {

  constructor() {
    cy.get('[page-id=catalog-search]');
  }

  public fillProductionYear() {
    cy.get('[test-id=production-year-panel]').click();
    cy.get('[id=mat-input-7]').type('2000');
    cy.get('[id=mat-input-8]').type('2004');
  }

  public selectGenres(genre: string) {
    cy.get('[test-id=genres-panel]').click();
    cy.get('mat-checkbox').contains(genre).click();
  }

  public selectLanguages() {
    cy.get('[test-id=languages-panel]').click();
    cy.get('[id=mat-input-9]').type('english');
    cy.get('mat-option').click();
  }
}

