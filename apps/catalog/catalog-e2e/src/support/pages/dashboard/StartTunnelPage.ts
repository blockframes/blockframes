import TunnelMainPage from "./TunnelMainPage";

export default class StartTunnelPage {
  constructor() {
    cy.get('catalog-movie-tunnel', { timeout: 5000 });
  }

  clickBegin() {
    cy.get('catalog-movie-tunnel [test-id=next]').click();
    return new TunnelMainPage();
  }
}
