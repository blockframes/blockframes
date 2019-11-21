/// <reference types="cypress" />

import { setupForMacbook } from '@blockframes/e2e';

beforeEach(() => {
  setupForMacbook();
});

describe('story #569 - main app', () => {
  it('should exists', () => {
    cy.visit('/');
  });
});
