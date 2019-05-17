/// <reference types="cypress" />

import { LandingPage, HomePage, DeliveryListPage, DeliveryFormPage, NewTemplatePage, TemplateListPage, TemplateFormPage, TemplateDeleteModal } from "../support/app.po";

let currentID = 0;

const randomID = (): string => `${new Date().toISOString()}-${currentID++}`;

function generateRandomEmail(): string {
  return `cypress${Math.floor(Math.random() * 10000) + 1}@test.com`;
}

const MATERIALS = [
  {
    value: 'First Material Value',
    description: 'First Material Description',
    category: 'Category#1'
  },
  {
    value: 'Second Material Value',
    description: 'Second Material Description',
    category: 'Category#2'
  },
  {
    value: 'Third Material Value',
    description: 'Third Material Description',
    category: 'Category#3'
  }
];

const MATERIAL_CHANGED = {
  value: 'Value Changed',
  description: 'Description Changed',
  category: 'Category#Changed'
};

const TEMPLATE_NAME_1 = 'SaveAsTemplate';
const EMAIL_CYTEST = 'cytest@gmail.com';
const PASSWORD_CYTEST = 'azerty';
const MOVIE_CYTEST = 'I, robot';
const ORG_CYTEST = 'cytest';

beforeEach(() => {
  cy.clearCookies();
  cy.clearLocalStorage();
  cy.visit('/auth');
  cy.viewport('macbook-15');
});

describe('I m a user and i can save a delivery as template', () => {
  it('should login, go to a delivery, save it as a new template, edit a material in template, then delete this template', () => {
    // Connexion
    const p1: LandingPage = new LandingPage();
    p1.fillSigninEmail(EMAIL_CYTEST);
    p1.fillSigninPassword(PASSWORD_CYTEST);
    const p2: HomePage = p1.login();

    // Select a movie and a delivery
    const p3: DeliveryListPage = p2.clickOnMovie(MOVIE_CYTEST);

    // Select delivery
    const p4: DeliveryFormPage = p3.clickDelivery(ORG_CYTEST);

    // Save delivery as new template
    const p5: NewTemplatePage = p4.clickSaveAsTemplate();
    p5.openSelect();
    p5.pickOrganization(ORG_CYTEST);
    p5.fillName(TEMPLATE_NAME_1);
    const p6: DeliveryFormPage = p5.clickSave();
    p6.assertMaterialsCount(MATERIALS.length);

    // GO to template-list
    const p7: HomePage = p6.clickHome();
    const p8: TemplateListPage = p7.selectTemplates();
    const p9: TemplateFormPage = p8.selectTemplate(TEMPLATE_NAME_1);
    p9.assertMaterialsCount(MATERIALS.length);

    // Edit a material
    p9.clickEditMaterial(MATERIALS[1].value);
    p9.clearValue();
    p9.fillValue(MATERIAL_CHANGED.value);
    p9.clearDescription();
    p9.fillDescription(MATERIAL_CHANGED.description);
    p9.clearCategory();
    p9.fillCategory(MATERIAL_CHANGED.category);
    p9.clickSaveMaterial();
    p9.assertMaterialsCount(MATERIALS.length);
    p9.assertMaterialExists(MATERIAL_CHANGED.value, MATERIAL_CHANGED.description, MATERIAL_CHANGED.category);

    // Delete template
    const p10: TemplateDeleteModal = p9.deleteTemplate();
    const p11: TemplateListPage = p10.clickConfirm();
    p11.assertTemplateDoesNotExists(TEMPLATE_NAME_1);
  });
});
