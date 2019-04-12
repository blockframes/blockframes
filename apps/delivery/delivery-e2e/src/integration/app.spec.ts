/// <reference types="cypress" />
import { getTitle, LandingPage } from '../support/app.po';

let currentID = 0;

const randomID = (): string => `${new Date().toISOString()}-${currentID++}`;
const materials = [
  {
    value: 'First Material Value',
    description: 'First Material Description',
    category: 'Category #1'
  },
  {
    value: 'Second Material Value',
    description: 'Second Material Description',
    category: 'Category #2'
  },
  {
    value: 'Third Material Value',
    description: 'Third Material Description',
  }
];
const orgName = 'Organization #1'
const templateName = 'Template #2'


beforeEach(() => {
  cy.clearCookies();
  cy.visit('http://localhost:4200/auth');
  cy.viewport('macbook-15');
});

describe('Hello Delivery', () => {
  it('should display SIGN IN / SIGN UP component', () => {
    getTitle().contains('Sign in');
  });
});

describe('I m a user and i can save a delivery as template', () => {
  it('', () => {
    // Connexion
    let p: any = new LandingPage();
    p.fillEmail('delivery-test-e2e@cascade8.com');
    p.fillPassword('blockframes4tw');
    p = p.login();
    // Go to app
    p.displayMovieMenu();
    p.clickOpenIn();
    p = p.selectApp();
    // Create new delivery from scratch
    p = p.clickAddDelivery();
    p = p.clickCreateNewDelivery();
    // Add materials
    for (let i = 0; i < materials.length - 1; i++) {
      p.clickAdd();
      p.fillValue(materials[i].value);
      p.fillDescription(materials[i].description);
      p.fillCategory(materials[i].category);
      p.clickAddMaterial();
    }
    p.clickAddCategory();
    p.fillValue(materials[materials.length - 1].value);
    p.fillDescription(materials[materials.length - 1].description);
    p.clickAddMaterial();
    // Save delivery as new template
    p = p.clickSaveAsTemplate();
    p.clickSelect();
    p.pickOrganization(orgName);
    p.fillName(templateName);
    p = p.clickSave();
    p = p.selectDeliveries();
    // Check if delivery exists
    p.assertDeliveryExists();
    p = p.clickDelivery();
    // Check if all materials exists
    p.assertMaterialsExist(materials.length);
    // Delete delivery
    p = p.deleteDelivery();
    p.assertDeliveryIsDeleted();
    // Check if template exists
    p = p.selectTemplate();
    p.openAccordeon(orgName);
    p.assertTemplateExists(templateName);
    // Delete template
    // Create delivery from existing template
    // Add materials
    // Delete delivery

  });
});

// describe('i m a user and i can create an empty template', () => {
//   it('', () => {
//     let p: any = new LandingPage();
//     p.fillEmail('delivery-test-e2e@cascade8.com');
//     p.fillPassword('blockframes4tw');
//     p = p.login();
//     p.displayUserMenu();
//     p.selectOrganization('Org1');
//     cy.visit('/');
//     p = p.selectTemplate();
//     p = p.createTemplate();
//     const templateName= randomID();
//     p.fillTemplateName(templateName);
//     p = p.clickCreate();
//     p.assertTemplateExists(templateName);
//     //p.clickMenu(templateName);
//   })
// })
