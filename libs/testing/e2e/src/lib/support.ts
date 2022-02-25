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

export function acceptCookies() {
  cy.get('body').then(($body) => {
    if ($body.children('cookie-banner')) {
      cy.contains('Accept cookies').click();
    }
  });
}
