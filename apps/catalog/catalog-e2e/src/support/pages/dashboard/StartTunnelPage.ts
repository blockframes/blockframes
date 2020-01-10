import TunnelMainPage from "./TunnelMainPage";

export default class StartTunnelPage {
  constructor() {
    cy.get('catalog-start-tunnel', { timeout: 5000 });
  }

  clickBegin() {
    cy.get('catalog-start-tunnel [test-id=begin]').click();
    return new TunnelMainPage();
  }
}
