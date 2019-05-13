/// <reference types="cypress" />
import { getTitle, LandingPage } from '../support/app.po';

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

const EMAIL_USER1 = 'demo@blockframes.com';
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
  it('should login, create delivery from scratch, save it as a new template, then delete this template', () => {
    // Connexion
    let p: any = new LandingPage();
    p.fillSigninEmail(EMAIL_CYTEST);
    p.fillSigninPassword(PASSWORD_CYTEST);
    p = p.login();
    // Go to app
    p = p.clickOnMovie(MOVIE_CYTEST);
    // Create new delivery from scratch
    p = p.clickAddDelivery();
    p = p.clickCreateNewDelivery();
    p = p.clickDelivery();
    // Add materials
    MATERIALS.forEach(material => {
      p.clickAdd();
      p.fillValue(material.value);
      p.fillDescription(material.description);
      p.fillCategory(material.category);
      p.clickSaveMaterial();
    });
    // Save delivery as new template
    p = p.clickSaveAsTemplate();
    p.clickSelect();
    p.pickOrganization(ORG_NAME_1);
    p.fillName(TEMPLATE_NAME_1);
    p = p.clickSave();
    p = p.selectHome();
    p = p.clickOnMovie(MOVIE_CYTEST);
    // Check if delivery exists
    p.assertDeliveryExists(ORG_CYTEST);
    p = p.clickDelivery();
    // Check if all materials exists
    p.assertMaterialsCount(MATERIALS.length);
    // Check if template exists
    p = p.selectHome();
    p = p.selectTemplates();
    p.displayTemplateMenu(TEMPLATE_NAME_1);
    p = p.clickEdit();
    p.assertMaterialsCount(MATERIALS.length);
    p = p.selectTemplates();
    p.displayTemplateMenu(TEMPLATE_NAME_1);
    p.clickDelete();
    p.assertTemplateDoesNotExists(TEMPLATE_NAME_1);
  });
});

describe('Step 1: I\'m new user, I want accept a notification that add my org in a movie, create a delivery, add materials and sign', () => {
  it('should create delivery with a template, add step, add step to materials and sign delivery', () => {
    // TODO: reset database

    // Connexion
    let p: any = new LandingPage();
    p.fillSigninEmail(EMAIL_USER1);
    p.fillSigninPassword(PASSWORD_USER1);
    p = p.login();

    // TODO: accept the notification

    // Go to app-delivery
    p = p.clickOnMovie(MOVIE_STEP1);

    // Open template picker
    p = p.clickAddDelivery();

    // Select Jokers Delivery Schedule
    p = p.clickTemplateDelivery(TEMPLATE_USER1);

    // Add general date and step to delivery
    p.pickGeneralDate(GENERAL_DATE1);
    p.clickCreateStep();
    p.fillStepName(STEP_NAME1);
    p.pickStepDate(STEP_DATE1);
    p.clickSaveStep();

    // Go to team-work page
    p = p.clickTeamWork();
    p.clickAddStakeholder(ORG_USER2);
    p = p.clickDelivery();

    // Add step to materials
    p.clickCheckBoxMaterials(
      [VALUE_MAT1, VALUE_MAT2]
    );
    p.scrollToAction();
    p.clickButtonAction();
    p.clickChangeStep();
    p.clickAddStep(STEP_NAME1);
    //TODO: verify if materials have the step
    p.openLogout();
    p = p.clickLogout();

    // Sign in with cjentertainment@blockframes.com
    p.fillSigninEmail(EMAIL_USER2);
    p.fillSigninPassword(PASSWORD_USER2);
    p = p.login();

    // Accept invitation to delivery, delete one material and sign delivery
    p.openNotifications();
    p = p.clickAcceptInvitation();
    p = p.clickDelivery();
    p.clickDeleteMaterial(VALUE_MAT1);
    p.verifyDeletedMaterial(VALUE_MAT1);
    p.clickAddSignature();
    p.clickVerifyToSign();
    p.fillPassword(PASSWORD_USER2);
    p.clickSign();
    p.openLogout();
    p = p.clickLogout();

    // Login with demo@blockframes.com and sign the delivery
    p.fillSigninEmail(EMAIL_USER1);
    p.fillSigninPassword(PASSWORD_USER1);
    p = p.login();
    p = p.clickOnMovie(MOVIE_STEP1);
    p = p.clickDelivery();
    p.clickAddSignature();
    p.clickVerifyToSign();
    p.fillPassword(PASSWORD_USER1);
    p.clickSign();

    // Verify if we have 2 signatures
    p.verifySignatures(2);
  })
});
