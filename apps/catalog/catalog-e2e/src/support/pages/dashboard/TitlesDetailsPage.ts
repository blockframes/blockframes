import TitlesListPage from "./TitlesListPage";

const TITLES = 'My Titles';

export default class TitlesDetailsPage {
  constructor() {
    cy.get('catalog-title-view catalog-title-details');
  }

  public assertTitleExists(title: string) {
    cy.get('catalog-title-view header h1').contains(title);
  }

  public clickTitles() {
    cy.get('catalog-marketplace mat-sidenav mat-nav-list a').contains(TITLES).click();
    return new TitlesListPage();
  }
}
