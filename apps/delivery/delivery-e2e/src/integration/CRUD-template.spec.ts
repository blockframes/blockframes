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
    const p4: TemplateCreatePage = p3.clickContextMenuTemplate(false) as TemplateCreatePage;
    const p5: NewTemplatePage = p4.clickNewTemplate();

    // create a new template
    p5.fillName(TEMPLATE_NAME_1);
    let p6: TemplateFormPage = p5.clickNext();

    // create a new material
    p6.addMaterial();
    p6.fillMaterial(MATERIALS[0]);
    p6.assertMaterial(MATERIALS[0]);
    p6.saveMaterial();

    // go back to template list
    let p7: TemplateListPage = p6.clickContextMenuTemplate(true) as TemplateListPage;
    p7.assertTemplate(TEMPLATE_NAME_1);

    // re-open previous template
    p6 = p7.editTemplate(TEMPLATE_NAME_1);

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

    // go back to template list
    p7 = p6.clickContextMenuTemplate(true) as TemplateListPage;

    // delete the template
    p7.deleteTemplate(TEMPLATE_NAME_1);

    // assert that the list is empty
    p7.assertNoTemplates();
   });
});
