import { gmail_v1 } from 'googleapis';

export const gmail = {
  queryEmails(query: string): Cypress.Chainable<gmail_v1.Schema$Message[]> {
    // see possibles queries at https://support.google.com/mail/answer/7190?hl=fr
    return cy.task('queryEmails', query);
  },

  getEmail(emailId: string): Cypress.Chainable<gmail_v1.Schema$Message> {
    return cy.task('getEmail', emailId);
  },

  deleteEmail(emailId: string): Cypress.Chainable<string> {
    return cy.task('deleteEmail', emailId);
  },
};
