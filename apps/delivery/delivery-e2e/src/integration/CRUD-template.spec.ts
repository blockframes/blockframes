/// <reference types="cypress" />
import { AddTemplateModal, HomePage, LandingPage, TemplateFormPage, TemplateListPage, LoginPage } from '../support/pages';
import { User } from '../support/utils/type';

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

const USER: Partial<User> = {
  email: 'cytest@blockframes.com',
  password: 'azerty'
}

beforeEach(() => {
  cy.clearCookies();
  cy.clearLocalStorage();
  cy.visit('/auth');
  cy.viewport('macbook-15');
});

describe('Test CRUD template', () => {
  it.skip('should login, create a template, create materials, delete materials, edit material, then delete this template', () => {
    // Connexion
    const p1: LandingPage = new LandingPage();
    const p2: LoginPage = p1.clickCallToAction();
    p2.fillSignin(USER);
    const p3: HomePage = p2.clickSigninWithMovies();
    // Go to template list and create a new template
    const p4: TemplateListPage = p3.selectTemplates();
    const p5: AddTemplateModal = p4.createTemplate();
    p5.fillTemplateName(TEMPLATE_NAME_1);
    const p6: TemplateFormPage = p5.clickCreate();

    // Add materials
    MATERIALS.forEach(material => {
      p6.clickAdd();
      p6.fillValue(material.value);
      p6.fillDescription(material.description);
      p6.fillCategory(material.category);
      p6.clickSaveMaterial();
    });
    p6.assertMaterialsCount(MATERIALS.length);

    // Delete one material
    p6.clickDeleteMaterial(MATERIALS[0].value);
    p6.assertMaterialsCount(MATERIALS.length - 1);

    // Edit a material
    p6.clickEditMaterial(MATERIALS[1].value);
    p6.clearValue();
    p6.fillValue(MATERIAL_CHANGED.value);
    p6.clearDescription();
    p6.fillDescription(MATERIAL_CHANGED.description);
    p6.clearCategory();
    p6.fillCategory(MATERIAL_CHANGED.category);
    p6.clickSaveMaterial();
    p6.assertMaterialsCount(MATERIALS.length - 1);
    p6.assertMaterialExists(
      MATERIAL_CHANGED.value,
      MATERIAL_CHANGED.description,
      MATERIAL_CHANGED.category
    );

    // Go to template list and delete the template
    const p7: TemplateListPage = p6.selectTemplates();
    p7.assertTemplateExists(TEMPLATE_NAME_1);
    p7.displayTemplateMenu(TEMPLATE_NAME_1);
    p7.deleteTemplate();
    p7.assertTemplateDoesNotExists(TEMPLATE_NAME_1);
  });
});
