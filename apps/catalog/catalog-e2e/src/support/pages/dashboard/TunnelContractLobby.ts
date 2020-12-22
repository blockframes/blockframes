import TunnelContractPage from "./TunnelContractPage";
import { SEC } from "@blockframes/e2e/utils/env";

export default class TunnelContractLobbyPage {
  constructor() {
    cy.get('contract-tunnel-lobby', {timeout: 60 * SEC});
  }

  public static navigateToPage() {
    cy.visit('c/o/dashboard/tunnel/contract');
    cy.wait(1 * SEC);
    return new TunnelContractLobbyPage();
  }

  public clickSale() {
    cy.get('contract-tunnel-lobby mat-card[test-id=sale]', {timeout: 3 * SEC})
      .click();
    return new TunnelContractPage();
  }
}
