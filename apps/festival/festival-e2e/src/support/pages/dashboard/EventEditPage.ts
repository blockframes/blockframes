import FestivalDashboardHomePage from './FestivalDashboardHomePage';
import { SEC } from '@blockframes/e2e/utils';

export default class EventEditPage {
  constructor() {
    cy.scrollTo(0, 500, { ensureScrollable: false });
    cy.wait(1 * SEC);
    cy.scrollTo(0, 100, { ensureScrollable: false });
    cy.get('event-edit', { timeout: 90 * SEC });
  }

  addEventTitle(title: string) {
    cy.get('event-edit input[test-id=event-title]').clear().type(title);
  }

  //Sets if event is full day.
  checkAllDay(fullDay: boolean = true) {
    if (fullDay) {
      cy.get('event-edit mat-slide-toggle[test-id=all-day]', { timeout: 3 * SEC })
        .find('input')
        .check({ force: true });
    } else {
      cy.get('event-edit mat-slide-toggle[test-id=all-day]', { timeout: 3 * SEC })
        .find('input')
        .uncheck({ force: true });
    }
  }

  selectDate(date: Date) {
    // Start Date
    cy.get('mat-form-field[test-id=event-start]').click();
    cy.get('event-edit time-picker[formControlName=start]')
      .get('tbody')
      .contains(date.getDate())
      .click();
    // End Date
    cy.get('mat-form-field[test-id=event-end]').click();
    cy.get('event-edit time-picker[formControlName=end]')
      .get('tbody')
      .contains(date.getDate())
      .click();
  }

  //set event access
  uncheckPrivate(isPublic: boolean = false) {
    if (!isPublic) {
      cy.get('event-edit mat-slide-toggle[test-id=event-private]', { timeout: 3 * SEC })
        .find('input')
        .check({ force: true });
    } else {
      cy.get('event-edit mat-slide-toggle[test-id=event-private]', { timeout: 3 * SEC })
        .find('input')
        .uncheck({ force: true });
    }
  }

  selectMovie(movieName: string) {
    cy.get('event-edit mat-select[formControlName=titleId]', { timeout: 100 * SEC }).click();
    cy.get('mat-option').contains(movieName).click();
  }

  inviteUser(email: string | string[]) {
    if (Array.isArray(email)) {
      let index = 0;
      while (index < email.length) {
        cy.get('event-edit algolia-chips-autocomplete input').type(email[index]).type('{enter}');
        index++;
      }
    } else {
      cy.get('event-edit algolia-chips-autocomplete input').type(email).type('{enter}');
    }
    cy.get('event-edit button[test-id=event-invite]').click({ timeout: 0.5 * SEC });
    cy.wait(2 * SEC);
  }

  copyGuests() {
    cy.get('event-edit invitation-guest-list button[test-id=invitation-copy]').click();
  }

  saveEvent() {
    cy.get('button[test-id=event-save]', { timeout: 1 * SEC }).click();
    cy.wait(2 * SEC);
  }

  clickMoreDetails() {
    cy.get('button[test-id=more-details]', { timeout: 1 * SEC }).click();
    cy.wait(1 * SEC);
  }

  goToDashboard() {
    cy.visit('/c/o/dashboard/home');
    return new FestivalDashboardHomePage();
  }
}
