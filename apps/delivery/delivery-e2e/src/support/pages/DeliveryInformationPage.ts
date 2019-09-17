import { DeliveryInformation } from '../utils/type';

export default class DeliveryInformationPage {
  constructor() {
    cy.get('[page-id=delivery-information]', { timeout: 10000 });
  }

  public addMGAmount(information: DeliveryInformation) {
    this.openMGDeadlinesEditPanel();
    this.fillMGAmount(information);
  }

  public openMGDeadlinesEditPanel() {
    cy.get('[page-id=delivery-information] [test-id=edit-MG-button]').click();
  }

  public fillMGAmount(information: DeliveryInformation) {
    cy.get('[page-id=delivery-information] input[type=number]').type(information.minimumGuarantee.amount);
    cy.get('[page-id=delivery-information] mat-select').click();
    cy.get('mat-option')
      .contains(information.minimumGuarantee.currency)
      .click();
  }

  public addDeadlines(information: DeliveryInformation) {
    information.minimumGuarantee.deadlines.forEach(deadline => {
      cy.get('[page-id=delivery-information] button[test-id=add-deadline]').click();
      cy.get('[page-id=delivery-information] input[formControlName=label]')
        .last()
        .type(deadline.label);
      cy.get('[page-id=delivery-information] input[formControlName=percentage]')
        .last()
        .type(deadline.percentage);
      cy.get('[page-id=delivery-information] input[formControlName=date]')
        .last()
        .type(deadline.date);
    });
  }

  public addDates(information: DeliveryInformation) {
    this.openDatesEditPanel();
    this.fillDates(information);
  }

  public openDatesEditPanel() {
    cy.get('[page-id=delivery-information] [test-id=edit-dates-button]').click();
  }

  public fillDates(information: DeliveryInformation) {
    cy.get('[page-id=delivery-information] input[formControlName=dueDate]')
      .last()
      .type(information.dates.dueDate);
    cy.get('[page-id=delivery-information] input[formControlName=acceptationPeriod]')
      .last()
      .type(information.dates.approvalPeriod);
    cy.get('[page-id=delivery-information] input[formControlName=reWorkingPeriod]')
      .last()
      .type(information.dates.reworkingPeriod);
  }

  public openStepsEditPanel() {
    cy.get('[page-id=delivery-information] [test-id=edit-steps-button]').click();
  }

  public addSteps(information: DeliveryInformation) {
    this.openStepsEditPanel();
    information.steps.forEach(step => {
      cy.get('[page-id=delivery-information] button[test-id=add-step]').click();
      cy.get('[page-id=delivery-information] input[formControlName=name]')
        .last()
        .type(step.name);
      cy.get('[page-id=delivery-information] input[formControlName=date]')
        .last()
        .type(step.date);
    });
  }

  public clickUpdateChanges() {
    cy.get('[page-id=delivery-information] button[test-id=save]').click();
    cy.get('[page-id=delivery-information] button[test-id=close]').click();
  }

  public assertAllInformationFieldsExists(information: DeliveryInformation) {
    this.assertDeadlinesExist(information);
    this.assertDatesExist(information);
    this.assertStepExists(information);
  }

  public assertDeadlinesExist(information: DeliveryInformation) {
    information.minimumGuarantee.deadlines.forEach(deadline => {
      cy.get('[page-id=deadlines-table] tr').should(tr =>
        expect(tr)
          .to.contain(deadline.label)
          .to.contain(deadline.percentage)
          .to.contain(deadline.date)
      );
    });
  }

  public assertDatesExist(information: DeliveryInformation) {
    cy.get('[page-id=delivery-information] span[test-id=due-date]')
      .should(span => expect(span).to.contain(information.dates.dueDate));
    cy.get('[page-id=delivery-information] span[test-id=approval-period]')
      .should(span => expect(span).to.contain(information.dates.approvalPeriod));
    cy.get('[page-id=delivery-information] span[test-id=reworking-period]')
      .should(span => expect(span).to.contain(information.dates.reworkingPeriod));
  }

  public assertStepExists(information: DeliveryInformation) {
    information.steps.forEach(step => {
      cy.get('[page-id=steps-table] tr').should(tr =>
        expect(tr)
          .to.contain(step.name)
          .to.contain(step.date)
      );
    });
  }
}
