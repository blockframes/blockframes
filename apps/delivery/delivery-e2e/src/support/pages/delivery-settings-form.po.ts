/// <reference types="cypress" />

import { DeliveryFormPage } from "./delivery-form.po";
import { DeliveryTeamWorkPage } from "./delivery-teamwork.po";

export class DeliverySettingsFormPage {
  constructor() {
  }
  public pickGeneralDate(date: string) {
    cy.get('mat-datepicker-toggle button.mat-icon-button').click();
    cy.contains(date).click();
  }

  public clickCreateStep() {
    cy.get('button.create-step').click();
  }

  public fillStepName(stepName: string) {
    cy.get('input.stepName').type(stepName);
  }

  public pickStepDate(date: string) {
    cy.get('mat-form-field.stepDate button.mat-icon-button').click();
    cy.contains(date).click();
  }

  public clickSaveStep() {
    cy.get('button.add-button').click();
  }

  public clickTeamWork() {
    cy.get('a').contains('teamwork').click();
    return new DeliveryTeamWorkPage;
  }

  public clickDelivery() {
    cy.get('a').contains('edit').click();
    return new DeliveryFormPage;
  }
}
