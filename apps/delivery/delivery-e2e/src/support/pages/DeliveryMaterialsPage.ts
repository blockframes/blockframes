import NavbarPage from "./NavbarPage";
import DeliveryListPage from "./DeliveryListPage";
import { Material } from "../utils/type";
import DeliveryInformationPage from "./DeliveryInformationPage";
import DeleteDeliveryModal from "./DeleteDeliveryModal";
import SaveAsTemplateModal from "./SaveAsTemplateModal";

export default class DeliveryMaterialsPage extends NavbarPage {
  constructor() {
    super();
    cy.get('[page-id=delivery-materials]', { timeout: 10000 });
  }

  public clickDeliveriesTab(): DeliveryListPage {
    cy.get('[page-id=navbar] .mat-tab-links').get('a').contains('deliveries').click();
    return new DeliveryListPage();
  }

  public clickInformationTab(): DeliveryInformationPage {
    cy.get('[page-id=navbar] .mat-tab-links').get('a').contains('information').click();
    return new DeliveryInformationPage();
  }

  public assertDeliveryMustBeSigned() {
    cy.get('[page-id=delivery-materials] [test-id=sign-icon]');
  }

  public assertTableDisplayPrice() {
    cy.get('[page-id=delivery-materials] th[test-id=material-price]');
  }

  public assertMaterialExists(material: Material) {
    cy.get('[page-id=delivery-materials] tr').should((tr) =>
      expect(tr)
        .to.contain(material.title)
        .to.contain(material.category)
        .to.contain(material.description)
    );
  }

  public clickDeleteDelivery(): DeleteDeliveryModal {
    cy.get('[page-id=delivery-materials] mat-icon[svgIcon=delete]').click();
    return new DeleteDeliveryModal();
  }

  public clickSaveAsTemplate() {
    cy.get('[page-id=delivery-materials] [test-id=save-as-template]').click();
    return new SaveAsTemplateModal();
  }
}
