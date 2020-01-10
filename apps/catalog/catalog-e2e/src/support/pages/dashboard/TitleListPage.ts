import StartTunnelPage from "./StartTunnelPage";

export default class TitlesListPage {
  constructor() {
    cy.get('catalog-title-list', { timeout: 5000 });
  }

  clickAdd() {
    cy.get('catalog-title-list [test-id=add-movie]').click();
    return new StartTunnelPage();
  }
}
