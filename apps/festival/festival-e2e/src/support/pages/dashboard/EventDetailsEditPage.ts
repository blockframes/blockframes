import FestivalDashboardHomePage from './FestivalDashboardHomePage';
import { SEC } from '@blockframes/e2e/utils';

export default class EventDetailsEditPage {
  constructor() {
    cy.get('event-details-edit', { timeout: 90 * SEC });
  }

  addEventTitle(title: string) {
    cy.get('event-details-edit input[formControlName="title"]').clear().type(title);
  }

  //Sets if event is full day.
  checkAllDay(fullDay: boolean = true) {
    if (fullDay) {
      cy.get('event-details-edit mat-slide-toggle[test-id=all-day]', { timeout: 10 * SEC })
        .find('input')
        .check({ force: true });
    } else {
      cy.get('event-details-edit mat-slide-toggle[test-id=all-day]', { timeout: 10 * SEC })
        .find('input')
        .uncheck({ force: true });
    }
  }

  selectDate(date: Date) {
    // Start Date
    cy.get('mat-form-field[test-id=event-start]', { timeout: 10 * SEC }).click();
    cy.get('event-details-edit time-picker[formControlName=start]')
      .get('tbody')
      .contains(date.getDate())
      .click();
    // End Date
    cy.get('mat-form-field[test-id=event-end]').click();
    cy.get('event-details-edit time-picker[formControlName=end]')
      .get('tbody')
      .contains(date.getDate())
      .click();
  }

  //set event access
  uncheckPrivate(isPublic: boolean = false) {
    if (!isPublic) {
      //last radio button correspond to "private" privacy status
      cy.get('event-details-edit [type="radio"]', { timeout: 10 * SEC })
        .eq(1)
        .check({force: true});
    } else {
      //first radio button correspond to "public" privacy status
      cy.get('event-details-edit [type="radio"]', { timeout: 10 * SEC })
        .first()
        .check({force: true});
    }
  }

  selectMovie(movieName: string) {
    cy.get('[formControlName="titleId"]', { timeout: 10 * SEC }).click();
    cy.get('mat-option').contains(movieName, {timeout: 5 * SEC}).click();
  }

  inputDescription(description: string) {
    //Input description
    cy.get('textarea[formControlName="description"]', {timeout: 20 * SEC})
      .click({force: true})
      .clear()
      .type(description);
  }

  inviteUser(email: string | string[]) {
    if (Array.isArray(email)) {
      let index = 0;
      while (index < email.length) {
        cy.get('event-details-edit algolia-chips-autocomplete input', { timeout: 10 * SEC }).type(email[index]).type('{enter}');
        index++;
      }
    } else {
      cy.get('event-details-edit algolia-chips-autocomplete input').type(email).type('{enter}');
    }
    cy.get('event-details-edit button[test-id=event-invite]').click({ timeout: 3 * SEC });
    cy.wait(2 * SEC);
  }

  copyGuests() {
    cy.get('event-details-edit invitation-guest-list button[test-id=invitation-copy]').click();
  }

  saveEvent() {
    cy.get('button[test-id=event-save]', { timeout:  30 * SEC }).click();
    cy.wait(1 * SEC);
  }

  clickMoreDetails() {
    cy.get('button[test-id=more-details]', { timeout: 10 * SEC }).click();
    cy.wait(1 * SEC);
  }

  goToDashboard() {
    cy.visit('/c/o/dashboard/home');
    return new FestivalDashboardHomePage();
  }
}
