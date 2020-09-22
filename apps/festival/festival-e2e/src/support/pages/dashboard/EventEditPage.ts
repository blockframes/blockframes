﻿import FestivalDashboardHomePage from './FestivalDashboardHomePage';

export default class EventEditPage {
  constructor() {
    cy.scrollTo(0, 500, {ensureScrollable: false});
    cy.wait(1000);
    cy.scrollTo(0, 100, {ensureScrollable: false});
    cy.get('event-edit', {timeout: 90000})
  }

  addEventTitle(title: string) {
    cy.get('event-edit input[test-id=event-title]').clear().type(title);
  }

  checkAllDay() {
    cy.get('event-edit mat-checkbox[test-id=all-day]').find('input').check({ force: true });
  }

  selectDate(date: Date) {
    // Start Date
    cy.get('mat-form-field[test-id=event-start]').click();
    cy.get('event-edit time-picker[formControlName=start]').get('tbody').contains(date.getDate()).click();
      // End Date
    cy.get('mat-form-field[test-id=event-end]').click();
    cy.get('event-edit time-picker[formControlName=end]').get('tbody').contains(date.getDate()).click();
  }

  uncheckPrivate() {
    cy.get('event-edit mat-checkbox[test-id=event-private]').find('input').uncheck({ force: true });
  }

  selectMovie(movieName: string) {
    cy.get('event-edit mat-select[formControlName=titleId]', {timeout: 99000})
      .click();
    cy.get('mat-option').contains(movieName).click();
  }

  inviteUser(email: string | string[]) {
    if(Array.isArray(email)){
      let index = 0;
      while(index < email.length) {
        cy.get('event-edit algolia-chips-autocomplete input').type(email[index]).type('{enter}')
        index ++;
      }
    } else {
      cy.get('event-edit algolia-chips-autocomplete input').type(email).type('{enter}')
    }
    cy.get('event-edit button[test-id=event-invite]').click({timeout: 500});
    cy.wait(2000)
  }

  copyGuests() {
    cy.get('event-edit invitation-guest-list button[test-id=invitation-copy]').click();
  }

  saveEvent() {
    cy.get('button[test-id=event-save]', {timeout: 1000}).click();
    cy.wait(2000);
  }

  clickMoreDetails() {
    cy.get('button[test-id=more-details]', {timeout: 1000}).click();
    cy.wait(1000);
  }

  goToDashboard() {
    cy.visit('/c/o/dashboard/home');
    return new FestivalDashboardHomePage();
  }
}
