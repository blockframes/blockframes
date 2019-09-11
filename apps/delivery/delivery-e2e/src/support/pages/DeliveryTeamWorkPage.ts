import DeliveryFormPage from "./DeliveryFormPage";

export default class DeliveryTeamWorkPage {
  constructor() {}

    public clickAddStakeholder(name: string) {
      cy.wait(500);
      cy.get('mat-card.mat-elevation-z0')
      .should('contain', name)
      .contains(name).parent().parent()
      .find('button').click();
    }

    public clickDelivery() {
      cy.get('a').contains('edit').click();
      return new DeliveryFormPage();
    }
  }
