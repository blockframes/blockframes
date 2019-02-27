/// <reference types="cypress" />

import { getGreeting } from '../support/app.po';
import { Landing } from '../support/app.po';

describe('Hello Movie Financing', () => {
  beforeEach(() => cy.visit('/'));

  it.skip('should display welcome message', () => {
    getGreeting().contains('Welcome to movie-financing!');
  });
});

describe('story 1: je peux me connecter', () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.visit('/');
    cy.viewport('macbook-15');
  });

  it('', () => {
    let p: any = new Landing();
    p = p.clickConnection();
    p.fillEmail('vincent@laposte.net');
    p.fillPassword('helloworld');
    p = p.login();
  });
});

describe('story 2: Je peux me connecter et créer un Film', () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.visit('/');
    cy.viewport('macbook-15');
  });

  it.skip('', () => {
    let p: any = new Landing();
    // User Story authentication
    p = p.clickConnection();
    p.fillEmail('vincent@laposte.net');
    p.fillPassword('helloworld');
    p = p.login();
    // User Story creation of a film begins here
    p = p.clickNewMovie();
    p.fillTitle('Akira');
    p.fillProductionCompany('Tohei');
    p.fillInternationalSalesCompany('Buena Vista');
    p.fillDirector('Akira Kurosawa');
    p.fillWriter('Hayayo Myiazaki');
    p.fillCast('Toshiro Mifune');
    p.selectGenre('Animation');
    p.selectStatus('In Completion');
    p.fillLogline('A secret military project endangers Neo-Tokyo when it turns a biker gang member into a rampaging psychic psychopath that only two teenagers and a group of psychics can stop.');
    p.fillBudget('150000000');
    p.uploadImage('../fixtures/akira_test');
    p.fillAsk('150000000');
    p.fillMinimumInvestment('15000000');
    p = p.submitForm();
    p.findMovieItemByTitle('Akira');
  });
});
