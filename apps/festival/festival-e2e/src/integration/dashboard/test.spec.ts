/// <reference types="cypress" />
/// <reference path="../../support/index.d.ts" />

import { User, QueryInferface } from '../../fixtures';

describe('User create a screening', () => {
  let user
  beforeEach(() => {
    
  });

  it('Test', () => {
    const u = cy.getUser({exist: false, index: 0 });
    cy.log(u);
    console.log(u);

    expect(true).to.be.true;
  })

});
