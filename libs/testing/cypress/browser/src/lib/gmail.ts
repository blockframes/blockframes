export const gmail = {
  getTotalMessages() {
    return cy.task('getMessagesTotal');
  },

  queryEmails(query: string) {
    return cy.task('queryEmails', query);
  },

  getEmail(emailId: string) {
    return cy.task('getEmail', emailId);
  },
};
