/// <reference types="cypress" />

import { LandingPage, HomePage, TemplateListPage, TemplateFormPage, AddTemplateModal } from "../support/app.po";

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

const TEMPLATE_NAME_1 = 'CRUD template';

const EMAIL_CYTEST = 'cytest@gmail.com';
const PASSWORD_CYTEST = 'azerty';

beforeEach(() => {
  cy.clearCookies();
  cy.clearLocalStorage();
  cy.visit('/auth');
  cy.viewport('macbook-15');
});

describe('Test CRUD template', () => {
  it('should login, create a template, create materials, delete materials, edit material, then delete this template', () => {
    // Connexion
    const p1: LandingPage = new LandingPage();
    p1.fillSigninEmail(EMAIL_CYTEST);
    p1.fillSigninPassword(PASSWORD_CYTEST);
    const p2: HomePage = p1.login();

    // Go to template list and create a new template
    const p3: TemplateListPage = p2.selectTemplates();
    const p4: AddTemplateModal = p3.createTemplate();
    p4.fillTemplateName(TEMPLATE_NAME_1);
    const p5: TemplateFormPage = p4.clickCreate();

    // Add materials
    MATERIALS.forEach(material => {
      p5.clickAdd();
      p5.fillValue(material.value);
      p5.fillDescription(material.description);
      p5.fillCategory(material.category);
      p5.clickSaveMaterial();
    });
    p5.assertMaterialsCount(MATERIALS.length);

    // Delete one material
    p5.clickDeleteMaterial(MATERIALS[0].value);
    p5.assertMaterialsCount(MATERIALS.length - 1);

    // Edit a material
    p5.clickEditMaterial(MATERIALS[1].value);
    p5.clearValue();
    p5.fillValue(MATERIAL_CHANGED.value);
    p5.clearDescription();
    p5.fillDescription(MATERIAL_CHANGED.description);
    p5.clearCategory();
    p5.fillCategory(MATERIAL_CHANGED.category);
    p5.clickSaveMaterial();
    p5.assertMaterialsCount(MATERIALS.length - 1);
    p5.assertMaterialExists(MATERIAL_CHANGED.value, MATERIAL_CHANGED.description, MATERIAL_CHANGED.category);

    // Go to template list and delete the template
    const p6: TemplateListPage = p5.selectTemplates();
    p6.assertTemplateExists(TEMPLATE_NAME_1);
    p6.displayTemplateMenu(TEMPLATE_NAME_1);
    p6.deleteTemplate();
    p6.assertTemplateDoesNotExists(TEMPLATE_NAME_1);
  });
});

