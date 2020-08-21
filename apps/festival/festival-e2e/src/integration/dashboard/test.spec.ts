/// <reference types="cypress" />
/// <reference path="../../support/index.d.ts" />

describe('User create a screening', () => {
  beforeEach(() => {
    
  });

  it('Test', () => {
    const u = cy.getFixture('user');
    cy.log(u);
    console.log(u);

    expect(true).to.be.true;
  })

});
