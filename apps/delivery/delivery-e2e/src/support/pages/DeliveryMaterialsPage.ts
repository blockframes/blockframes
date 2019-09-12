import NavbarPage from "./NavbarPage";
import DeliveryListPage from "./DeliveryListPage";
import { Material } from "../utils/type";
import DeliveryInformationPage from "./DeliveryInformationPage";
import DeleteDeliveryModal from "./DeleteDeliveryModal";

export default class DeliveryMaterialsPage extends NavbarPage {
  constructor() {
    super();
    cy.get('[page-id=delivery-materials]', { timeout: 10000 });
  }

  public clickDeliveriesTab(): DeliveryListPage {
    cy.get('.mat-tab-links').get('a').contains('deliveries').click();
    return new DeliveryListPage();
  }

  public clickInformationTab(): DeliveryInformationPage {
    cy.get('.mat-tab-links').get('a').contains('information').click();
    return new DeliveryInformationPage();
  }

  public assertDeliveryMustBeSigned() {
    cy.get('[test-id=sign-icon]');
  }

  public assertTableDisplayPrice() {
    cy.get('th[test-id=material-price]');
  }

  public assertMaterialsExists(material: Material) {
    cy.get('tr').should((tr) =>
      expect(tr)
        .to.contain(material.title)
        .to.contain(material.category)
        .to.contain(material.description)
    );
  }

  public clickDeleteDelivery(): DeleteDeliveryModal {
    cy.get('mat-icon[svgIcon=delete]').click();
    return new DeleteDeliveryModal();
  }
}
