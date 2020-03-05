export default class TunnelContractSummaryPage {
  constructor() {
    cy.get('contract-tunnel-summary-sale');
  }

  public assertFirstPartyNameExists(name: string) {
    cy.get('contract-tunnel-summary-sale ul li').contains(name);
  }

  public assertTermsExist(event: string, duration: string, period: string) {
    cy.get('contract-tunnel-summary-sale ul li').contains(event);
    cy.get('contract-tunnel-summary-sale ul li').contains(duration);
    cy.get('contract-tunnel-summary-sale ul li').contains(period);
  }

  public assertCurrencyExists(currency: string) {
    cy.get('contract-tunnel-summary-sale ul li').contains(currency);
  }

  public assertPackagePriceExists(price: string) {
    cy.get('contract-tunnel-summary-sale ul li').contains(price);
  }
}
