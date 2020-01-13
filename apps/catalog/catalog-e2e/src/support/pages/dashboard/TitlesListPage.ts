import StartTunnelPage from "./StartTunnelPage";

export default class TitlesListPage {
  constructor() {
    cy.get('catalog-title-list', { timeout: 5000 });
  }

  public static navigateToPage() {
    cy.visit('c/o/dashboard/titles');
    return new TitlesListPage();
  }

  clickAdd() {
    cy.get('catalog-title-list [test-id=add-movie]').click();
    return new StartTunnelPage();
  }
}
