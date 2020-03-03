import TunnelContractPage from "./TunnelContractPage";

export default class TunnelContractLobbyPage {
  constructor() {
    cy.get('contract-tunnel-lobby');
  }

  public static navigateToPage() {
    cy.visit('c/o/dashboard/tunnel/contract');
    return new TunnelContractLobbyPage();
  }

  public clickSale() {
    cy.get('contract-tunnel-lobby mat-card[test-id=sale]').click();
    return new TunnelContractPage();
  }
}
