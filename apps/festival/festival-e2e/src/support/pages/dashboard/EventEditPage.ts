export default class EventEditPage {
  constructor() {
    cy.get('event-edit')
  }

  addEventTitle(title: string) {
    cy.get('input[test-id=event-title]').clear().type(title);
  }

  selectDate(date: Date) {
    cy.get('mat-form-field[test-id=event-start]').click().get('time-picker[formControlName=start]').get('div').contains(date.getDate()).click();
    cy.get('mat-form-field[test-id=event-end]').click().get('time-picker[formControlName=end]').get('div').contains(date.getDate()).click();
  }

  checkPrivate() {
    cy.get('mat-checkbox[test-id=event-private]').find('input').check({ force: true })
  }

  selectMovie(title: string) {
    cy.get('mat-select[formControlName=titleId]').click().get('mat-option').contains(title).click();
  }

  saveEvent() {
    cy.get('button[test-id=event-save]').click()
  }
}