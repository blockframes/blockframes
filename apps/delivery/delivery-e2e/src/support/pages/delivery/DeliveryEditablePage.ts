import NavbarPage from "../NavbarPage";
import { Material } from "../../utils/type";
import ConfirmModal from "../ConfirmModal";
import SaveAsTemplateModal from "../SaveAsTemplateModal";

export default class DeliveryEditablePage extends NavbarPage {
  constructor() {
    super();
    cy.get('[page-id=delivery-editable]', { timeout: 20000 });
  }

  public assertDeliveryMustBeSigned() {
    cy.get('[page-id=delivery-editable] [test-id=sign-icon]');
  }

  public assertTableDisplayPrice() {
    cy.get('[page-id=delivery-editable] th[test-id=material-price]');
  }

  public assertMaterialExists(material: Material) {
    cy.get('[page-id=delivery-editable] tr').should((tr) =>
      expect(tr)
        .to.contain(material.title)
        .to.contain(material.category)
        .to.contain(material.description)
    );
  }

  public clickDeleteDelivery(): ConfirmModal {
    cy.get('[page-id=delivery-editable] mat-icon[svgIcon=delete]').click();
    return new ConfirmModal();
  }

  public clickSaveAsTemplate() {
    cy.get('[page-id=delivery-editable] [test-id=save-as-template]').click();
    return new SaveAsTemplateModal();
  }
}
