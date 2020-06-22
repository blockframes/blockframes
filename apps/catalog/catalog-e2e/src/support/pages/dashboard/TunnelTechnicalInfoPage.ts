import TunnelPromotionalImagesPage from "./TunnelPromotionalImagesPage";

export default class TunnelTechnicalInfoPage {
  constructor() {
    cy.get('catalog-tunnel-technical-info', { timeout: 5000 });
  }

  public static navigateToPage(movieId: string) {
    cy.visit(`c/o/dashboard/tunnel/movie/${movieId}/technical-info`);
    return new TunnelTechnicalInfoPage();
  }

  // Format

  public selectShootingFormat(format: string) {
    cy.get('catalog-tunnel-technical-info movie-form-format mat-select[test-id=shooting]').click();
    cy.get('mat-option').contains(format).click();
  }

  public assertShootingFormatIsSelected(format: string) {
    cy.get('catalog-tunnel-technical-info movie-form-format mat-select[test-id=shooting]').contains(format);
  }

  public selectFormatQuality(format: string) {
    cy.get('catalog-tunnel-technical-info movie-form-format mat-select[test-id=quality]').click();
    cy.get('mat-option').contains(format).click();
  }

  public assertFormatQualityIsSelected(format: string) {
    cy.get('catalog-tunnel-technical-info movie-form-format mat-select[test-id=quality]').contains(format);
  }

  public selectColor(format: string) {
    cy.get('catalog-tunnel-technical-info movie-form-format mat-select[test-id=color]').click();
    cy.get('mat-option').contains(format).click();
  }

  public assertColorIsSelected(format: string) {
    cy.get('catalog-tunnel-technical-info movie-form-format mat-select[test-id=color]').contains(format);
  }

  public selectSoundQuality(format: string) {
    cy.get('catalog-tunnel-technical-info movie-form-format mat-select[test-id=sound]').click();
    cy.get('mat-option').contains(format).click();
  }

  public assertSoundQualityIsSelected(format: string) {
    cy.get('catalog-tunnel-technical-info movie-form-format mat-select[test-id=sound]').contains(format);
  }

  // Available Versions

  public selectLanguage(partialLanguage: string, language: string) {
    cy.get('catalog-tunnel-technical-info movie-form-version-info form-language input').type(partialLanguage);
    cy.get('mat-option').contains(language).click();
  }

  public assertLanguageExists(language: string) {
    cy.get('catalog-tunnel-technical-info movie-form-version-info h5').contains(language);
  }

  public checkSubtitled() {
    cy.get('catalog-tunnel-technical-info movie-form-version-info mat-checkbox[formcontrolname=subtitle]').find('input').check({ force: true });
  }

  public assertSubtitledIsChecked() {
    cy.get('catalog-tunnel-technical-info movie-form-version-info mat-checkbox[formcontrolname=subtitle]').find('input').should('have.attr', 'aria-checked', 'true')
  }

  public clickNext() {
    cy.get('[test-id=next]').click();
    return new TunnelPromotionalImagesPage();
  }
}
