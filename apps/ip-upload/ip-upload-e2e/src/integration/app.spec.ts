/// <reference types="cypress" />

import { getTitle } from '../support/app.po';

describe('Hello Nx', () => {
  beforeEach(() => cy.visit('/'));

  it('should display welcome message', () => {
    getTitle().contains('Welcome');
  });
});
