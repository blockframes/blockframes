/// <reference types="cypress" />
import { getTitle, LandingPage, HomePage, MovieTeamWorkPage, DeliveryListPage, TemplatePickerPage, DeliverySettingsFormPage, DeliveryTeamWorkPage, DeliveryFormPage, NewTemplatePage, TemplateListPage, TemplateFormPage } from '../support/app.po';

let currentID = 0;

const randomID = (): string => `${new Date().toISOString()}-${currentID++}`;
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

const EMAIL_USER1 = 'hello@thejokers.com';
const PASSWORD_USER1 = 'blockframes';
const MOVIE_STEP1 = 'PARASITE';
const TEMPLATE_USER1 = 'THE JOKERS DELIVERY SCHEDULE';

const EMAIL_USER2 = 'cjentertainment@blockframes.com';
const PASSWORD_USER2 = 'blockframes';
const ORG_USER2 = 'CJ Entertainment';

const VALUE_MAT1 = 'Music of the Picture on CD protools or MP3 files';
const VALUE_MAT2 = 'Any key artwork and all contractual logo materials';
const STEP_NAME1 = 'Marketing';
const STEP_DATE1 = '26';
const GENERAL_DATE1 = '30';

function generateRandomEmail(): string {
  return `cypress${Math.floor(Math.random() * 10000) + 1}@test.com`;
}

beforeEach(() => {
  cy.clearCookies();
  cy.clearLocalStorage();
  cy.visit('/auth');
  cy.viewport('macbook-15');
});

describe('Hello Delivery', () => {
  it('should display h1 with "Sign in" in it', () => {
    getTitle().contains('Sign in');
  });
});

// TODO: finish this test
describe('I m a user and i can save a delivery as template', () => {
  it.skip('should login, create delivery from scratch, save it as a new template, then delete this template', () => {
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


describe('Step 1: I\'m a user, I want accept a notification that add my org in a movie, create a delivery with a template, add a stakeholder, and sign', () => {
  it('should create delivery with a template, add step, add step to materials and sign delivery', () => {
    // TODO: reset database

    // Connexion
    const p1: LandingPage = new LandingPage();
    p1.fillSigninEmail(EMAIL_USER1);
    p1.fillSigninPassword(PASSWORD_USER1);

    const p2: HomePage = p1.login();

    // TODO: accept the notification
    p2.openNotifications();
    const p3: MovieTeamWorkPage = p2.clickAcceptInvitationToMovie();
    const p4: HomePage = p3.clickHome();

    // Go to app-delivery
    const p5: DeliveryListPage = p4.clickOnMovie(MOVIE_STEP1);

    // Open template picker
    const p6: TemplatePickerPage = p5.clickAddDelivery();

    // Select a template
    const p7: DeliverySettingsFormPage = p6.clickTemplateDelivery(TEMPLATE_USER1);

    // Add general date and step to delivery
    p7.pickGeneralDate(GENERAL_DATE1);
    p7.clickCreateStep();
    p7.fillStepName(STEP_NAME1);
    p7.pickStepDate(STEP_DATE1);
    p7.clickSaveStep();

    // Go to team-work page
    const p8: DeliveryTeamWorkPage = p7.clickTeamWork();
    p8.clickAddStakeholder(ORG_USER2);
    const p9: DeliveryFormPage = p8.clickDelivery();

    // Add step to materials
    p9.clickCheckBoxMaterials(
      [VALUE_MAT1, VALUE_MAT2]
    );
    p9.scrollToAction();
    p9.clickButtonAction();
    p9.clickChangeStep();
    p9.clickAddStep(STEP_NAME1);
    //TODO: verify if materials have the step
    p9.openLogout();
    const p10 = p9.clickLogout();

    // Sign in with cjentertainment@blockframes.com
    p10.fillSigninEmail(EMAIL_USER2);
    p10.fillSigninPassword(PASSWORD_USER2);
    const p11 = p10.login();

    // Accept invitation to delivery, delete one material and sign delivery
    p11.openNotifications();
    const p12: DeliveryTeamWorkPage = p11.clickAcceptInvitationToDelivery();
    const p13: DeliveryFormPage = p12.clickDelivery();
    p13.clickDeleteMaterial(VALUE_MAT1);
    p13.verifyDeletedMaterial(VALUE_MAT1);
    p13.clickAddSignature();
    p13.clickVerifyToSign();
    p13.fillPassword(PASSWORD_USER2);
    p13.clickSign();
    p13.openLogout();
    const p14: LandingPage = p13.clickLogout();

    // Login with demo@blockframes.com and sign the delivery
    p14.fillSigninEmail(EMAIL_USER1);
    p14.fillSigninPassword(PASSWORD_USER1);
    const p15: HomePage = p14.login();
    const p16: DeliveryListPage = p15.clickOnMovie(MOVIE_STEP1)
    const p17: DeliveryFormPage = p16.clickDelivery();
    p17.clickAddSignature();
    p17.clickVerifyToSign();
    p17.fillPassword(PASSWORD_USER1);
    p17.clickSign();

    // Verify if we have 2 signatures
    p17.verifySignatures(2);
  })
});
