import StartTunnelPage from "./StartTunnelPage";

export default class TitlesListPage {
  constructor() {
    cy.get('catalog-title-list');
  }

  public static navigateToPage() {
    cy.visit('c/o/dashboard/titles');
    return new TitlesListPage();
  }

  clickAdd() {
    cy.get('catalog-title-list [test-id=add-movie]', { timeout: 30000 }).click();
    return new StartTunnelPage();
  }
}
