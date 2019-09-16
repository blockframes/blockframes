export default class DistributionPage {
  constructor() {
    cy.get('[page-id=distribution-right]');
  }

  public selectDates() {
    cy.get('[test-id=datepicker-input]').click();
    cy.get('[aria-label="September 1, 2019"]').click();
    cy.get('[aria-label="September 10, 2019"]').click();
    cy.get('button[test-id=add-selection]', { timeout: 10000 }).click();
  }

  public selectTerritory() {
    cy.get('[page-id=distribution-right] [test-id=distribution-territory-panel]').click();
    cy.get('[page-id=distribution-right] input[test-id=distribution-territory-input]').type('World');
    // TODO: can't click mat-option
    // cy.get('mat-option', { timeout: 10000 }).contains('World').click();
  }

  public selectMedias(medias: string[]) {
    cy.get('[page-id=distribution-right] [test-id=distribution-media-panel]').click();
    medias.forEach(media => cy.get('[page-id=distribution-right] mat-checkbox').contains(media).click());
  }

  // TODO: can't click mat-option
  public selectLanguage() {
    cy.get('[page-id=distribution-right] [test-id=distribution-language-panel]').click();
    cy.get('[page-id=distribution-right] [test-id=distribution-language-input]').click();
    // cy.get('mat-option').contains('English').click();
    cy.get('[page-id=distribution-right] [test-id=distribution-dubbing-input]').click();
    // cy.get('mat-option').contains('French').click();
  }

  public clickDistributionSearch() {
    cy.get('[page-id=distribution-right] button[test-id=distribution-search]').click();
  }

  public clickAddDistribution() {
    cy.get('[page-id=distribution-right] a[test-id=add-distribution-button]').click();
  }
}
