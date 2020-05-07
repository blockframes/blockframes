export default class EventEditPage {
  constructor() {
    cy.get('event-edit')
  }

  addEventTitle(title: string) {
    cy.get('input[test-id=event-title]').clear().type(title);
  }

  selectDate(date: Date) {
    // Start Date
    cy.get('mat-form-field[test-id=event-start]').click();
    cy.get('time-picker[formControlName=start]').get('div').contains(date.getDate()).click();
      // End Date
    cy.get('mat-form-field[test-id=event-end]').click();
    cy.get('time-picker[formControlName=end]').get('div').contains(date.getDate()).click();
  }

  checkPrivate() {
    cy.get('event-edit mat-checkbox[test-id=event-private]').find('input').check({ force: true })
  }

  selectMovie() {
    cy.get('event-edit mat-select[formControlName=titleId]').click().get('mat-option').first().click()
  }

  saveEvent() {
    cy.get('button[test-id=event-save]').click()
  }
}