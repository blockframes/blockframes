import StartTunnelPage from "./StartTunnelPage";

export default class TitlesPage {
  constructor() {
    cy.get('catalog-titles-page', { timeout: 5000 });
  }

  clickAdd() {
    cy.get('catalog-titles-page [test-id=add-movie]').click();
    return new StartTunnelPage();
  }
}
