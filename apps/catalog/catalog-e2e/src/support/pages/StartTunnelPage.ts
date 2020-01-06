export default class StartTunnelPage {
  constructor() {
    cy.get('catalog-start-tunnel', { timeout: 5000 });
  }

  clickBegin() {
    cy.get('catalog-start-tunnel [test-id=begin]').click();
    // issue#1407: Will return the movie tunnel page 2
  }
}
