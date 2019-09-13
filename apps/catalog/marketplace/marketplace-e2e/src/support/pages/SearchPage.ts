export default class SearchPage {

  constructor() {
    cy.get('[page-id=catalog-search]');
  }

  public fillProductionYear() {
    cy.get('[test-id=production-year-panel]').click();
    cy.get('[id=mat-input-7]').type('2018');
    cy.get('[id=mat-input-8]').type('2019');
  }

  public selectGenre(genre: string) {
    cy.get('mat-panel-title').contains('Genre').click();
    cy.get('mat-checkbox').contains(genre).click();
  }
}

