//Test if email is sent correctly.

describe('Check spinner wait until', () => {
  beforeEach(() => {
    cy.visit('/');
  });
  
  it.only('Wait for API to load', () => {
    cy.get('h1', {timeout: 10000})
      .contains("Want to learn more?");

   //cy.get('[test-id="screening-spinner"]', {timeout: 10000})
   //  .should('not.exist');
  });

  it('Wait for API to load', () => {
    //Test for an page element
    cy.get('h1', {timeout: 10000}).contains("Screening List2");
    //Test if spinner has gone
    cy.get('[test-id="screening-spinner"]', {timeout: 10000})
      .should('not.exist');
  });
});