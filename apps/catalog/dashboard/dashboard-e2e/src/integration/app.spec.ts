import { getH1 } from '../support/app.po';

describe('catalog-dashboard', () => {
  beforeEach(() => cy.visit('/'));

  it.skip('should display welcome message', () => {
    getH1().contains('Welcome to catalog-dashboard!');
  });
});
