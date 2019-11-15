import { getGreeting } from '../support/app.po';

describe('catalog-dashboard', () => {
  beforeEach(() => cy.visit('/'));

  it.skip('should display welcome message', () => {
    getGreeting().contains('Welcome to catalog-dashboard!');
  });
});
