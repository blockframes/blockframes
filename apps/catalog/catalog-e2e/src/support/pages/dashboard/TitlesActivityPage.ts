export default class TitlesActivityPage {
  constructor() {
    cy.get('catalog-title-view catalog-title-activity');
  }

  public assertTitleExists(title: string) {
    cy.get('catalog-title-view header h1').contains(title);
  }
}
