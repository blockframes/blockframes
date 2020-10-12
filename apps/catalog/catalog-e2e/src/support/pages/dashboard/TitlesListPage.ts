import StartTunnelPage from "./StartTunnelPage";
import TitlesActivityPage from "./TitlesActivityPage";

export default class TitlesListPage {
  constructor() {
    cy.get('catalog-title-list', { timeout: 20000 });
  }

  public static navigateToPage() {
    cy.visit('c/o/dashboard/title');
    return new TitlesListPage();
  }

  clickAdd() {
    cy.get('catalog-title-list [test-id=add-movie]', { timeout: 30000 })
      .click();
    return new StartTunnelPage();
  }

  public clickMovieLigne(title: string) {
    cy.get('catalog-title-list table tr', { timeout: 30000 }).contains(title).click();
    return new TitlesActivityPage();
  }

  public clickLastPageTable() {
    cy.get('catalog-title-list mat-paginator button').last().click({ force: true });
  }
}
