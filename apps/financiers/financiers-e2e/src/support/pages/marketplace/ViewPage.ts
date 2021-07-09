import { SEC } from "@blockframes/e2e/utils";

export default class ViewPage {

  constructor() {
    cy.get('financiers-movie-view', { timeout: 20000 });
  }

  public openDiscussionModale() {
    cy.get('button[test-id="open-discussion"]', {timeout: 3 * SEC}).click();
  }

  public fillDiscussionForm(data) {
    //Subject
    cy.get('mat-select[formControlName="subject"]', {timeout: 3 * SEC}).click();
    cy.get(`mat-option`, {timeout: 3 * SEC}).contains(data.subject).click();

    // Scope
    cy.get('input[formControlName="from"]', {timeout: 3 * SEC}).type(data.scope.from);
    cy.get('input[formControlName="to"]', {timeout: 3 * SEC}).type(data.scope.to);

    // Message
    cy.get('textarea[formControlName="message"]', {timeout: 3 * SEC}).type(data.message);
  }

  public sendDIscussionEmail() {
    cy.get('button[type="submit"]', {timeout: 3 * SEC}).contains('Send your message').click();
  }
}

