/// <reference types="cypress" />
import WelcomeViewPage from '../../../../../libs/e2e/src/lib/support/WelcomeViewPage';
import {
  DeliveryListPage,
  MovieListPage,
  TemplateEditablePage,
  TemplateListPage,
  LoginViewPage,
  DeliveryEditablePage,
  SaveAsTemplateModal
} from '../support/pages';
import { User } from '../support/utils/type';
import { MATERIALS } from '../support/utils/data';

const USER: Partial<User> = {email: 'cytest@blockframes.com', password: 'azerty'}

const TEMPLATE_NAME_1 = 'Saveastemplate';
const MOVIE_CYTEST = 'I, robot';
const ORG_CYTEST = 'cytestorg';

beforeEach(() => {
  cy.clearCookies();
  cy.clearLocalStorage();
  cy.visit('/auth');
  cy.viewport('macbook-15');
  const p1: WelcomeViewPage = new WelcomeViewPage();
  const p2: LoginViewPage = p1.clickCallToAction();
  p2.fillSignin(USER);
  p2.clickSigninWithMovies();
});

describe('I m a user and I can save a delivery as template', () => {
  it.skip('should login, go to a delivery, save it as a new template, go to an other delivery and save it as uptade existing template', () => {
    // Go to the first delivery and save it as new template
    const p1 = new MovieListPage();
    const p2: DeliveryListPage = p1.clickOnMovie(MOVIE_CYTEST);
    const p3: DeliveryEditablePage = p2.clickFirstDelivery(ORG_CYTEST);
    const p4: SaveAsTemplateModal = p3.clickSaveAsTemplate();
    p4.fillName(TEMPLATE_NAME_1);
    const p5: DeliveryEditablePage = p4.clickSave();

    // Verify if the template exists and contains the right materials
    const p6: MovieListPage = p5.clickHome();
    const p7: TemplateListPage = p6.clickContextMenuTemplates();
    const p8: TemplateEditablePage = p7.editTemplate(TEMPLATE_NAME_1);
    p8.assertMaterialExists(MATERIALS[0]);

    // Go to an other delivery and save it as overwriting the existing template
    const p9: MovieListPage = p8.clickHome();
    const p10: DeliveryListPage = p9.clickOnMovie(MOVIE_CYTEST);
    const p11: DeliveryEditablePage = p10.clickLastDelivery(ORG_CYTEST);
    const p12: SaveAsTemplateModal = p11.clickSaveAsTemplate();
    p12.fillName(TEMPLATE_NAME_1);
    const p13: DeliveryEditablePage = p12.clickUpdate();

    // Verify if the template is overwrote with right materials
    const p14: MovieListPage = p13.clickHome();
    const p15: TemplateListPage = p14.clickContextMenuTemplates();
    const p16: TemplateEditablePage = p15.editTemplate(TEMPLATE_NAME_1);
    p16.assertMaterialExists(MATERIALS[1]);
    p16.assertMaterialExists(MATERIALS[2]);
  });
});
