export function awaitElementDeletion(selector: string, timeout?: number) {
  const settings = { timeout };
  if (timeout) {
    cy.get(selector).should('exist');
    cy.get(selector, settings).should('not.exist');
  } else {
    cy.get(selector).should('exist');
    cy.get(selector).should('not.exist');
  }
}
