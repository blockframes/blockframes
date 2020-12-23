import SearchPage from "./SearchPage";

export default class FeedbackPage {
  constructor() {
    cy.get('[page-id=feedback-message]');
  }

  public clickRedirect() {
    cy.get('[page-id=feedback-message] a[test-id=feedback-link]', { timeout: 1000 }).click()
    return new SearchPage();
  }
}
