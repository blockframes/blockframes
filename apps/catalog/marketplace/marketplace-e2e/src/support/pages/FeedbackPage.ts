import { SearchPage } from ".";

export default class FeedbackPage {
  constructor() {
    cy.get('[page-id=feedback-message]');
  }

  public clickRedirect() {
    cy.get('[page-id=feedback-message] a[test-id=feedback-link]').click()
    return new SearchPage();
  }
}
