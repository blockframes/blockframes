import TunnelMainPage from "./TunnelMainPage";

export default class StartTunnelPage {
  constructor() {
    cy.get('catalog-layout', { timeout: 5000 });
  }

  clickBegin() {
    cy.get('catalog-layout [test-id=next]').click();
    return new TunnelMainPage();
  }
}
