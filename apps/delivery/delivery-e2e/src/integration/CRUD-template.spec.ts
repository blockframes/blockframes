/// <reference types="cypress" />
import {
  LandingPage,
  LoginPage,
  MovieCreatePage,
  NewTemplatePage,
  TemplateFormPage,
  TemplateListPage
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

const TEMPLATE_NAME_1 = 'Crud Template';

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
    const p4: TemplateCreatePage = p3.clickContextMenuTemplatesCreate();
    const p5: NewTemplatePage = p4.clickNewTemplate();

    // create a new template
    p5.fillName(TEMPLATE_NAME_1);
    const p6: TemplateFormPage = p5.clickNext();

    // create a new material
    p6.addMaterial();
    p6.fillMaterial(MATERIALS[0]);
    p6.assertMaterial(MATERIALS[0]);
    p6.saveMaterial();
    p6.assertMaterial(MATERIALS[0]);

    // go back to template list
    const p7: TemplateListPage = p6.clickContextMenuTemplates();
    p7.assertTemplate(TEMPLATE_NAME_1);

    // re-open previous template
    const p8: TemplateFormPage = p7.editTemplate(TEMPLATE_NAME_1);

    // create another one
    p8.addMaterial();
    p8.fillMaterial(MATERIALS[1]);
    p8.assertMaterial(MATERIALS[1]);
    p8.saveMaterial();
    p6.assertMaterial(MATERIALS[1]);

    // edit the first one
    p8.editMaterial(MATERIALS[0]);
    p8.clearMaterial();
    p8.fillMaterial(MATERIALS[2]);
    p8.assertMaterial(MATERIALS[2]);
    p8.saveMaterial();
    p6.assertMaterial(MATERIALS[2]);

    // delete both
    p8.editMaterial(MATERIALS[1]);
    p8.deleteMaterial();
    p8.editMaterial(MATERIALS[2]);
    p8.deleteMaterial();
    p8.assertNoMaterials();

    // go back to template list
    const p9: TemplateListPage = p6.clickContextMenuTemplates();

    // delete the template
    p9.deleteTemplate(TEMPLATE_NAME_1);

    // assert that the list is empty
    p9.assertNoTemplates();
   });
});
