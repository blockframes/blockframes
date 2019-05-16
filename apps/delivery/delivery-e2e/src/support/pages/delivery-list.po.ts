/// <reference types="cypress" />

import { DeliveryFormPage } from "./delivery-form.po";
import { TemplatePickerPage } from "./template-picker.po";

export class DeliveryListPage {
  constructor() {
  }

  public clickAddDelivery() {
    cy.get('button.add-delivery').click();
    return new TemplatePickerPage();
  }

  public assertDeliveryExists(orgName: string) {
    cy.get('.delivery-card').should('contain', orgName);
  }

  public clickDelivery() {
    cy.get('.delivery-card').first().click();
    return new DeliveryFormPage();
  }

  public assertDeliveryIsDeleted() {
    cy.get('.delivery-card').should('have.length', 0);
  }
}
