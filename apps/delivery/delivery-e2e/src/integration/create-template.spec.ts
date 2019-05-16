/// <reference types="cypress" />

import { LandingPage } from "../support/landing.po";
import { HomePage } from "../support/home.po";
import { DeliveryListPage } from "../support/delivery-list.po";
import { TemplatePickerPage } from "../support/template-picker.po";
import { DeliverySettingsFormPage } from "../support/delivery-settings-form.po";
import { DeliveryFormPage } from "../support/delivery-form.po";
import { NewTemplatePage } from "../support/new-template.po";
import { TemplateListPage } from "../support/template-list.po";
import { TemplateFormPage } from "../support/template-form.po";

let currentID = 0;

const randomID = (): string => `${new Date().toISOString()}-${currentID++}`;

function generateRandomEmail(): string {
  return `cypress${Math.floor(Math.random() * 10000) + 1}@test.com`;
}

const MATERIALS = [
  {
    value: 'First Material Value',
    description: 'First Material Description',
    category: 'Category #1'
  },
  {
    value: 'Second Material Value',
    description: 'Second Material Description',
    category: 'Category #2'
  }
];

const ORG_NAME_1 = 'cytest';
const TEMPLATE_NAME_1 = 'Template #2';

const EMAIL_CYTEST = 'cytest@gmail.com';
const PASSWORD_CYTEST = 'azerty';
const MOVIE_CYTEST = 'CY ROBOT';
const ORG_CYTEST = 'cytest';

beforeEach(() => {
  cy.clearCookies();
  cy.clearLocalStorage();
  cy.visit('/auth');
  cy.viewport('macbook-15');
});

// TODO: finish this test
describe('I m a user and i can save a delivery as template', () => {
  it('should login, create delivery from scratch, save it as a new template, then delete this template', () => {
    // Connexion
    const p1: LandingPage = new LandingPage();
    p1.fillSigninEmail(EMAIL_CYTEST);
    p1.fillSigninPassword(PASSWORD_CYTEST);
    const p2: HomePage = p1.login();
    // Go to app
    const p3: DeliveryListPage = p2.clickOnMovie(MOVIE_CYTEST);
    // Create new delivery from scratch
    const p4: TemplatePickerPage = p3.clickAddDelivery();
    const p5: DeliverySettingsFormPage = p4.clickCreateNewDelivery();
    const p6: DeliveryFormPage = p5.clickDelivery();
    // Add materials
    MATERIALS.forEach(material => {
      p6.clickAdd();
      p6.fillValue(material.value);
      p6.fillDescription(material.description);
      p6.fillCategory(material.category);
      p6.clickSaveMaterial();
    });
    // Save delivery as new template
    const p7: NewTemplatePage = p6.clickSaveAsTemplate();
    p7.clickSelect();
    p7.pickOrganization(ORG_NAME_1);
    p7.fillName(TEMPLATE_NAME_1);
    const p8: DeliveryFormPage = p7.clickSave();
    const p9: HomePage = p8.selectHome();
    const p10: DeliveryListPage = p9.clickOnMovie(MOVIE_CYTEST);
    // Check if delivery exists
    p10.assertDeliveryExists(ORG_CYTEST);
    const p11: DeliveryFormPage = p10.clickDelivery();
    // Check if all materials exists
    p11.assertMaterialsCount(MATERIALS.length);
    // Check if template exists
    const p12: HomePage = p11.selectHome();
    const p13: TemplateListPage = p12.selectTemplates();
    p13.displayTemplateMenu(TEMPLATE_NAME_1);
    const p14: TemplateFormPage = p13.clickEdit();
    p14.assertMaterialsCount(MATERIALS.length);
    const p15: TemplateListPage = p14.selectTemplates();
    p15.displayTemplateMenu(TEMPLATE_NAME_1);
    p15.clickDelete();
    p15.assertTemplateDoesNotExists(TEMPLATE_NAME_1);
  });
});
