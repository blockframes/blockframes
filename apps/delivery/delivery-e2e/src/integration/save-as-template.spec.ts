/// <reference types="cypress" />
import {
  DeliveryListPage,
  HomePage,
  LandingPage,
  NewTemplatePage,
  TemplateDeleteModal,
  TemplateFormPage,
  TemplateListPage,
  LoginPage,
  DeliveryMaterialsPage
} from '../support/pages';
import { User, Material } from '../support/utils/type';
import SaveAsTemplateModal from '../support/pages/SaveAsTemplateModal';

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

const MATERIAL_CHANGED = {
  value: 'Value Changed',
  description: 'Description Changed',
  category: 'Category#Changed'
};

const USER: Partial<User> = {email: 'cytest@blockframes.com', password: 'azerty'}

const TEMPLATE_NAME_1 = 'Saveastemplate';
const MOVIE_CYTEST = 'I, robot';
const ORG_CYTEST = 'cytestorg';

beforeEach(() => {
  cy.clearCookies();
  cy.clearLocalStorage();
  cy.visit('/auth');
  cy.viewport('macbook-15');
});

describe('I m a user and I can save a delivery as template', () => {
  it('should login, go to a delivery, save it as a new template, edit a material in template', () => {
    // Connexion
    const p1: LandingPage = new LandingPage();
    const p2: LoginPage = p1.clickCallToAction();
    p2.fillSignin(USER);
    const p3: HomePage = p2.clickSigninWithMovies();
    const p4: DeliveryListPage = p3.clickOnMovie(MOVIE_CYTEST);
    const p5: DeliveryMaterialsPage = p4.clickFirstDelivery(ORG_CYTEST);
    const p6: SaveAsTemplateModal = p5.clickSaveAsTemplate();
    p6.fillName(TEMPLATE_NAME_1);
    const p7: DeliveryMaterialsPage = p6.clickSave();
    const p8: HomePage = p7.clickHome();
    const p9: TemplateListPage = p8.clickContextMenuTemplates();
    const p10: TemplateFormPage = p9.editTemplate(TEMPLATE_NAME_1);
    p10.assertMaterial(MATERIALS[0]);



    const p11: HomePage = p10.clickHome();
    const p12: DeliveryListPage = p11.clickOnMovie(MOVIE_CYTEST);
    const p13: DeliveryMaterialsPage = p12.clickLastDelivery(ORG_CYTEST);
    const p14: SaveAsTemplateModal = p13.clickSaveAsTemplate();
    p14.fillName(TEMPLATE_NAME_1);
    const p15: DeliveryMaterialsPage = p14.clickUpdate();
    const p16: HomePage = p15.clickHome();
    const p17: TemplateListPage = p16.clickContextMenuTemplates();
    const p18: TemplateFormPage = p17.editTemplate(TEMPLATE_NAME_1);
    p18.assertMaterial(MATERIALS[1]);
    p18.assertMaterial(MATERIALS[2]);

    // TODO : updateTEmplate
  });
});
