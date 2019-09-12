/// <reference types="cypress" />
import {
  LandingPage,
  LoginPage,
  MovieCreatePage,
  NewTemplatePage,
  TemplateFormPage
} from '../support/pages';
import { User, Material } from '../support/utils/type';
import TemplateCreatePage from '../support/pages/TemplateCreatePage';

const MATERIALS: Material[] = [
  {
    title: 'First Material Value',
    description: 'First Material Description',
    category: 'Category#1'
  },
  {
    title: 'Second Material Value',
    description: 'Second Material Description',
    category: 'Category#2'
  },
  {
    title: 'Third Material Value',
    description: 'Third Material Description',
    category: 'Category#3'
  }
];

const TEMPLATE_NAME_1 = 'CRUD template';

const USER: User = {
  email: 'cypress@pl.com',
  surname: 'cypress',
  name: 'pl',
  password: 'blockframes'
};

beforeEach(() => {
  cy.clearCookies();
  cy.clearLocalStorage();
  cy.visit('/auth');
  cy.viewport('macbook-15');
});

describe('Test CRUD template', () => {
  it('should login, create a template, create materials, delete materials, edit material, then delete this template', () => {
    // Connection
    const p1: LandingPage = new LandingPage();
    const p2: LoginPage = p1.clickCallToAction();
    p2.fillSigning(USER);
    const p3: MovieCreatePage = p2.clickSigninWithNoMovies();

    // Go to template list
    const p4: TemplateCreatePage = p3.clickContextMenuTemplate();
    const p5: NewTemplatePage = p4.clickNewTemplate();

    // create a new template
    p5.fillName(TEMPLATE_NAME_1);
    const p6: TemplateFormPage = p5.clickNext();

    // create a new material
    p6.addMaterial();
    p6.fillMaterial(MATERIALS[0]);
    p6.assertMaterial(MATERIALS[0]);
    p6.saveMaterial();

    // create another one
    p6.addMaterial();
    p6.fillMaterial(MATERIALS[1]);
    p6.assertMaterial(MATERIALS[1]);
    p6.saveMaterial();

    // edit the first one
    p6.editMaterial(MATERIALS[0]);
    p6.clearMaterial();
    p6.fillMaterial(MATERIALS[2]);
    p6.assertMaterial(MATERIALS[2]);
    p6.saveMaterial();

    // delete both
    p6.editMaterial(MATERIALS[1]);
    p6.deleteMaterial();
    p6.editMaterial(MATERIALS[2]);
    p6.deleteMaterial();
    p6.assertNoMaterials();

  //   // Add materials
  //   MATERIALS.forEach(material => {
  //     p5.clickAdd();
  //     p5.fillValue(material.value);
  //     p5.fillDescription(material.description);
  //     p5.fillCategory(material.category);
  //     p5.clickSaveMaterial();
  //   });
  //   p5.assertMaterialsCount(MATERIALS.length);

  //   // Delete one material
  //   p5.clickDeleteMaterial(MATERIALS[0].value);
  //   p5.assertMaterialsCount(MATERIALS.length - 1);

  //   // Edit a material
  //   p5.clickEditMaterial(MATERIALS[1].value);
  //   p5.clearValue();
  //   p5.fillValue(MATERIAL_CHANGED.value);
  //   p5.clearDescription();
  //   p5.fillDescription(MATERIAL_CHANGED.description);
  //   p5.clearCategory();
  //   p5.fillCategory(MATERIAL_CHANGED.category);
  //   p5.clickSaveMaterial();
  //   p5.assertMaterialsCount(MATERIALS.length - 1);
  //   p5.assertMaterialExists(
  //     MATERIAL_CHANGED.value,
  //     MATERIAL_CHANGED.description,
  //     MATERIAL_CHANGED.category
  //   );

  //   // Go to template list and delete the template
  //   const p6: TemplateListPage = p5.selectTemplates();
  //   p6.assertTemplateExists(TEMPLATE_NAME_1);
  //   p6.displayTemplateMenu(TEMPLATE_NAME_1);
  //   p6.deleteTemplate();
  //   p6.assertTemplateDoesNotExists(TEMPLATE_NAME_1);
   });
});
