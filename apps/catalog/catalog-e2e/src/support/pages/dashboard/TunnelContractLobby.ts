import TunnelContractPage from "./TunnelContractPage";
import { TO } from "@blockframes/e2e/utils/env";

export default class TunnelContractLobbyPage {
  constructor() {
    cy.get('contract-tunnel-lobby', {timeout: TO.PAGE_LOAD});
  }

  public static navigateToPage() {
    cy.visit('c/o/dashboard/tunnel/contract');
    cy.wait(TO.ONE_SEC);
    return new TunnelContractLobbyPage();
  }

  public clickSale() {
    cy.get('contract-tunnel-lobby mat-card[test-id=sale]', {timeout: TO.PAGE_ELEMENT})
      .click();
    return new TunnelContractPage();
  }
}
