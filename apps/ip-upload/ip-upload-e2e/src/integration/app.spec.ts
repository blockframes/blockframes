/// <reference types="cypress" />
import { getTitle, Landing } from '../support/app.po';

describe('Hello Ip Upload', () => {
  beforeEach(() => cy.visit('/'));

  it('should display welcome message', () => {
    getTitle().contains('Welcome');
  });
});

describe('story 1: je peux me connecter et créer une IP', () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.visit('/');
    cy.viewport('macbook-15');
  });

  it('', () => {
    let p: any = new Landing();
    p = p.clickConnection();
    p.fillEmail('laurent+test@singulargarden.com');
    p.fillPassword('helloworld');
    p = p.login();
    p = p.clickNewIp();
    p.fillTitle('This is my title');
  });
});
