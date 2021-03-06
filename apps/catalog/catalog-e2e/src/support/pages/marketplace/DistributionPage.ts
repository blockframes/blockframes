import SelectionPage from "./SelectionPage";
import { Dates } from "@blockframes/e2e/utils/type";

export default class DistributionPage {
  constructor() {
    cy.get('[page-id=distribution-deal]', { timeout: 10000 });
  }

  public selectDates(dates: Dates) {
    cy.get('[test-id=datepicker-input]').click();
    cy.wait(2000);
    cy.get('div[class=mat-calendar-body-cell-content]').contains(dates.from).click();
    cy.get('div[class=mat-calendar-body-cell-content]').contains(dates.to).click();
    cy.get('button[test-id=add-selection]', { timeout: 10000 }).click();
  }

  // TODO: fixing mat-option referencing first input => ISSUE#950
  public selectTerritory(territory: string) {
    cy.get('[page-id=distribution-deal] [test-id=distribution-territory-panel]').click();
    cy.get('[page-id=distribution-deal] input[test-id=distribution-territory-input]').type(territory);
  }

  public selectMedias(medias: string[]) {
    cy.get('[page-id=distribution-deal] [test-id=distribution-media-panel]').click();
    medias.forEach(media => cy.get('[page-id=distribution-deal] mat-checkbox').contains(media).click());
  }

// TODO: fixing mat-option referencing first input => ISSUE#950
  public selectLanguage() {
    cy.get('[page-id=distribution-deal] [test-id=distribution-language-panel]').click();
    cy.get('[page-id=distribution-deal] [test-id=distribution-language-input]').click();
    cy.get('[page-id=distribution-deal] [test-id=distribution-dubbing-input]').click();
  }

  public clickDistributionSearch() {
    cy.get('[page-id=distribution-deal] button[test-id=distribution-search]').click();
  }

  public clickAddDistribution() {
    cy.get('[page-id=distribution-deal] a[test-id=add-distribution-button]').click()
    return new SelectionPage();
  }
}
