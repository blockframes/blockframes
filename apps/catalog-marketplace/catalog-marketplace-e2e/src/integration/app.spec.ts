import { getGreeting } from '../support/app.po';

describe('catalog-marketplace', () => {
  beforeEach(() => cy.visit('/'));

  it('should display welcome message', () => {
    getGreeting().contains('Welcome to catalog-marketplace!');
  });
});
