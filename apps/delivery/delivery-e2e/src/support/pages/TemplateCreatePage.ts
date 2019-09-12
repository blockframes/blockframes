import DeliveryFormPage from "./DeliveryFormPage";
import { NewTemplatePage } from ".";

export default class TemplateCreatePage {
  constructor() {
    cy.wait(1000);
    cy.get('[page-id=template-create]');
  }

  public clickNewTemplate() {
    cy.get('[page-id=template-create] button').click();
    return new NewTemplatePage();
  }

}
