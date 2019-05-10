/// <reference types="cypress" />
import { getTitle, LandingPage } from '../support/app.po';
import { P } from '@angular/cdk/keycodes';

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

const ORG_NAME_1 = 'Organization #1';
const TEMPLATE_NAME_1 = 'Template #2';

const EMAIL = 'delivery-test-e2e@cascade8.com';
const PASSWORD = 'blockframes4tw';

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
    let p: any = new LandingPage();
    p.fillSigninEmail(EMAIL);
    p.fillSigninPassword(PASSWORD);
    p = p.login();
    // Go to app
    p.displayMovieMenu();
    p.clickOpenIn();
    p = p.selectApp();
    // Create new delivery from scratch
    p = p.clickAddDelivery();
    p = p.clickCreateNewDelivery();
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
    p = p.selectDeliveries();
    // Check if delivery exists
    p.assertDeliveryExists();
    p = p.clickDelivery();
    // Check if all materials exists
    p.assertMaterialsExist(MATERIALS.length + 1);
    // Delete delivery
    p = p.deleteDelivery();
    p.assertDeliveryIsDeleted();
    // Check if template exists
    p = p.selectTemplate();
    p.openExpansionPanel(ORG_NAME_1);
    p.assertTemplateExists(TEMPLATE_NAME_1);
    p.displayTemplateMenu(TEMPLATE_NAME_1);
    p = p.clickEdit();
    cy.reload(); /// Have to reload to make the materials visible ///
    p.assertMaterialsExist(MATERIALS.length + 1);
    p = p.selectTemplate();
    p.openExpansionPanel(ORG_NAME_1);
    p.displayTemplateMenu(TEMPLATE_NAME_1);
    p.deleteTemplate();
    // TODO: Find a way to assert that template is deleted
    // => Expansion Panel still buggy
  });
});

describe('I\'m a paranoid user, I would like to create an account and verify that I own a contract on the blockchain', () => {
  it.skip('should type values in signup form', () => {
    // Connexion
    let p: any = new LandingPage();
    p.fillSignupEmail(generateRandomEmail());
    p.fillSignupPassword(PASSWORD);
    p = p.signup();

    // Go to profile page
    p.openUserMenu();
    p = p.clickProfile();

    // Assert id
    p.assertIdIsAddress();
  })
});

describe('Step 1: I\'m new user, I want accept a notification that add my org in a movie, create a delivery, add materials and sign', () => {
  it('should create delivery with a template, add step, add step to materials and sign delivery', () => {
    // TODO: reset database

    // Connexion
    let p: any = new LandingPage();
    p.fillSigninEmail('demo@blockframes.com');
    p.fillSigninPassword('blockframes');
    p = p.login();

    // TODO: accept the notification

    // Go to app-delivery
    p = p.clickOnMovie('PARASITE');

    // Open template picker
    p = p.clickAddDelivery();

    // Select Jokers Delivery Schedule
    p = p.clickTemplateDelivery('THE JOKERS DELIVERY SCHEDULE');

    // Add general date and step to delivery
    p.openGeneralDate();
    p.clickGeneralDate('30');
    p.clickCreateStep();
    p.fillStepName('Marketing');
    p.openStepDate();
    p.clickStepDate('26');
    p.clickSaveStep();

    // Go to team-work page
    p = p.clickTeamWork();
    p.clickAddStakeholder('CJ Entertainment');
    p = p.clickDelivery();

    // Add step to materials
    p.clickCheckBoxMaterials(
      ['Music of the Picture on CD protools or MP3 files',
      'Any key artwork and all contractual logo materials']
    );
    p.scrollToAction();
    p.clickButtonAction();
    p.clickChangeStep();
    p.clickAddStep('Marketing');
    //TODO: verify if materials have the step
    p.openLogout();
    p = p.clickLogout();

    // Sign in with cjentertainment@blockframes.com
    p.fillSigninEmail('cjentertainment@blockframes.com');
    p.fillSigninPassword('blockframes');
    p = p.login();

    // Accept invitation to delivery, delete one material and sign delivery
    p.openNotifications();
    p = p.clickAcceptInvitation();
    p = p.clickDelivery();
    p.clickDeleteMaterial('Music of the Picture on CD protools or MP3 files');
    p.verifyDeletedMaterial('Music of the Picture on CD protools or MP3 files');
    p.clickAddSignature();
    p.clickVerifyToSign();
    p.fillPassword('azerty');
    p.clickSign();
    p.openLogout();
    p = p.clickLogout();

    // Login with demo@blockframes.com and sign the delivery
    p.fillSigninEmail('demo@blockframes.com');
    p.fillSigninPassword('blockframes');
    p = p.login();
    p = p.clickOnMovie('PARASITE');
    p.clickDeliveries();
    p = p.clickDelivery();
    p.clickAddSignature();
    p.clickVerifyToSign();
    p.fillPassword('azerty');
    p.clickSign();

    // Verify if we have 2 signatures
    p.verifySignatures();
  })
});
