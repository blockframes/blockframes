/// <reference types="cypress" />
import {
  DeliveryListPage,
  HomePage,
  LandingPage,
  TemplateFormPage,
  TemplateListPage,
  LoginPage,
  DeliveryMaterialsPage,
  SaveAsTemplateModal
} from '../support/pages';
import { User, Material } from '../support/utils/type';

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
  const p1: LandingPage = new LandingPage();
  const p2: LoginPage = p1.clickCallToAction();
  p2.fillSignin(USER);
  p2.clickSigninWithMovies();
});

describe('I m a user and I can save a delivery as template', () => {
  it('should login, go to a delivery, save it as a new template, go to an other delivery and save it as uptade existing template', () => {
    // Go to the first delivery and save it as new template
    const p1 = new HomePage();
    const p2: DeliveryListPage = p1.clickOnMovie(MOVIE_CYTEST);
    const p3: DeliveryMaterialsPage = p2.clickFirstDelivery(ORG_CYTEST);
    const p4: SaveAsTemplateModal = p3.clickSaveAsTemplate();
    p4.fillName(TEMPLATE_NAME_1);
    const p5: DeliveryMaterialsPage = p4.clickSave();

    // Verify if the template exists and contains the right materials
    const p6: HomePage = p5.clickHome();
    const p7: TemplateListPage = p6.clickContextMenuTemplates();
    const p8: TemplateFormPage = p7.editTemplate(TEMPLATE_NAME_1);
    p8.assertMaterial(MATERIALS[0]);

    // Go to an other delivery and save it as overwriting the existing template
    const p9: HomePage = p8.clickHome();
    const p10: DeliveryListPage = p9.clickOnMovie(MOVIE_CYTEST);
    const p11: DeliveryMaterialsPage = p10.clickLastDelivery(ORG_CYTEST);
    const p12: SaveAsTemplateModal = p11.clickSaveAsTemplate();
    p12.fillName(TEMPLATE_NAME_1);
    const p13: DeliveryMaterialsPage = p12.clickUpdate();

    // Verify if the template is overwrote with right materials
    const p14: HomePage = p13.clickHome();
    const p15: TemplateListPage = p14.clickContextMenuTemplates();
    const p16: TemplateFormPage = p15.editTemplate(TEMPLATE_NAME_1);
    p16.assertMaterial(MATERIALS[1]);
    p16.assertMaterial(MATERIALS[2]);
  });
});
