/// <reference types="cypress" />
import { getTitle, LandingPage } from '../support/app.po';


let currentID = 0;

const randomID = (): string => (`${new Date().toISOString()}-${currentID++}`);

const createFakeScript = (title: string): any => cy.task('random:pdf', title);

beforeEach(() => {
  cy.clearCookies();
  cy.visit('/');
  cy.viewport('macbook-15');
});

describe('Hello Delivery', () => {
  it('should display login message', () => {
    getTitle().contains('Please Login');
  });
});

describe('i m a user and i can create an empty template', () => {
  it('', () => {
    let p: any = new LandingPage();
    p.fillEmail('laurent+test@singulargarden.com');
    p.fillPassword('helloworld');
    p = p.login();
    p.displayUserMenu();
    p.selectOrganization('Org1');
    cy.visit('/');
    p = p.selectTemplate();
    p = p.createTemplate();
    const templateName= randomID();
    p.fillTemplateName(templateName);
    p = p.clickCreate();
    p.assertTemplateExists(templateName);
    //p.clickMenu(templateName);
  })
})
