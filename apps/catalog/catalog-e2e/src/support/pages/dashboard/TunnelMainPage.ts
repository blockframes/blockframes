export default class TunnelMainPage {
  constructor() {
    cy.get('catalog-movie-tunnel-main', { timeout: 5000 });
  }

  public static navigateToPage(movieId: string) {
    cy.visit(`c/o/dashboard/tunnel/movie/${movieId}/main`);
    return new TunnelMainPage();
  }

  // Content Type

  public clickContentType() {
    cy.get('catalog-movie-tunnel-main movie-form-content-type mat-select[test-id=content-type]').click();
  }

  public selectContentType(contentType: string) {
    cy.get('mat-option').contains(contentType).click();
  }

  public assertContentTypeExists(contentType: string) {
    cy.get('catalog-movie-tunnel-main movie-form-content-type mat-select[test-id=content-type]').contains(contentType);
  }

  public clickFreshness() {
    cy.get('catalog-movie-tunnel-main movie-form-content-type mat-select[test-id=freshness]').click();
  }

  public selectFreshness(freshness: string) {
    cy.get('mat-option').contains(freshness).click();
  }

  public assertFreshnessExists(freshness: string) {
    cy.get('catalog-movie-tunnel-main movie-form-content-type mat-select[test-id=freshness]').contains(freshness);
  }

  public clickProductionStatus() {
    cy.get('catalog-movie-tunnel-main movie-form-content-type mat-select[test-id=production-status]').click();
  }

  public selectProductionStatus(status: string) {
    cy.get('mat-option').contains(status).click();
  }

  public assertProductionStatusExists(status: string) {
    cy.get('catalog-movie-tunnel-main movie-form-content-type mat-select[test-id=production-status]').contains(status);
  }

  public fillInternationalTitle(title: string) {
    cy.get('catalog-movie-tunnel-main movie-form-content-type input[test-id=international-title]').type(title);
  }

  public assertInternationalTitleExists(title: string) {
    cy.get('catalog-movie-tunnel-main movie-form-content-type input[test-id=international-title]').should('have.value', title);
  }

  public fillOriginalTitle(title: string) {
    cy.get('catalog-movie-tunnel-main movie-form-content-type input[test-id=original-title]').type(title);
  }

  public assertOriginalTitleExists(title: string) {
    cy.get('catalog-movie-tunnel-main movie-form-content-type input[test-id=original-title]').should('have.value', title);
  }

  public fillReference(reference: string) {
    cy.get('catalog-movie-tunnel-main movie-form-content-type input[test-id=reference]').type(reference);
  }

  public assertReferenceExists(reference: string) {
    cy.get('catalog-movie-tunnel-main movie-form-content-type input[test-id=reference]').should('have.value', reference);
  }

  // Director

  public fillDirectorFirstName(name: string) {
    cy.get('catalog-movie-tunnel-main movie-form-directors input[test-id=first-name]').type(name);
  }

  public assertDirectorFirstNameExists(name: string) {
    cy.get('catalog-movie-tunnel-main movie-form-directors input[test-id=first-name]').should('have.value', name);
  }

  public fillDirectorLastName(name: string) {
    cy.get('catalog-movie-tunnel-main movie-form-directors input[test-id=last-name]').type(name);
  }

  public assertDirectorLastNameExists(name: string) {
    cy.get('catalog-movie-tunnel-main movie-form-directors input[test-id=last-name]').should('have.value', name);
  }

  public fillDirectorFilmography(filmography: string) {
    cy.get('catalog-movie-tunnel-main movie-form-directors textarea').type(filmography);
  }

  public assertDirectorFilmographyExists(filmography: string) {
    cy.get('catalog-movie-tunnel-main movie-form-directors textarea').should('have.value', filmography);
  }

  // Country of origin
  public selectCountry(partialCountry: string, country: string) {
    cy.get('catalog-movie-tunnel-main movie-form-original-releases form-country input').type(partialCountry);
    cy.get('mat-option').contains(country).click();
  }

  public assertCountryIsSelected(country: string) {
    cy.get('catalog-movie-tunnel-main movie-form-original-releases form-country input').should('have.value', country);
  }

  public selectMedia(media: string) {
    cy.get('catalog-movie-tunnel-main movie-form-original-releases mat-select[test-id=media]').click();
    cy.get('mat-option').contains(media).click();
  }

  public assertMediaIsSelected(media: string) {
    cy.get('catalog-movie-tunnel-main movie-form-original-releases mat-select[test-id=media]').contains(media);
  }

  public fillCountryDate(date: string) {
    cy.get('catalog-movie-tunnel-main movie-form-original-releases input[test-id=date]').type(date);
  }

  public assertCountryDateExists(date: string) {
    cy.get('catalog-movie-tunnel-main movie-form-original-releases input[test-id=date]').should('have.value', date);
  }

  // Domestic distributor

  public fillFirstDistributorName(name: string) {
    cy.get('catalog-movie-tunnel-main movie-form-stakeholders input[test-id=name]').first().type(name);
  }

  public assertFirstDestributorNameExists(name: string) {
    cy.get('catalog-movie-tunnel-main movie-form-stakeholders input[test-id=name]').first().should('have.value', name);
  }

  public fillLastDistributorName(name: string) {
    cy.get('catalog-movie-tunnel-main movie-form-stakeholders input[test-id=name]').last().type(name);
  }

  public assertLastDestributorNameExists(name: string) {
    cy.get('catalog-movie-tunnel-main movie-form-stakeholders input[test-id=name]').last().should('have.value', name);
  }

  public fillFirstDistributorCountry(country: string) {
    cy.get(`catalog-movie-tunnel-main movie-form-stakeholders [test-id=auto-complete] input`).first().type(country);
  }

  public selectFirstDistributorCountry(country: string) {
    cy.get('mat-option').contains(country).click();
  }

  public assertFirstDistributorCountryExists(country: string) {
    cy.get(`catalog-movie-tunnel-main movie-form-stakeholders [test-id=auto-complete] mat-chip`).first().contains(country);
  }

  public clickAddDistributor() {
    cy.get(`catalog-movie-tunnel-main movie-form-stakeholders button[test-id=add]`).click();
  }

  public fillLastDistributorCountry(country: string) {
    cy.get(`catalog-movie-tunnel-main movie-form-stakeholders [test-id=auto-complete] input`).last().type(country);
  }

  public selectLastDistributorCountry(country: string) {
    cy.get('mat-option').contains(country).click();
  }

  public assertLastDistributorCountryExists(country: string) {
    cy.get(`catalog-movie-tunnel-main movie-form-stakeholders [test-id=auto-complete] mat-chip`).last().contains(country);
  }

  // Original Language

  public fillFirstOriginalLanguage(partialLanguage: string, language: string) {
    cy.get('catalog-movie-tunnel-main movie-form-languages input').first().type(partialLanguage);
    cy.get('mat-option').contains(language).click();
  }

  public assertFirstOriginalLanguageExists(language: string) {
    cy.get('catalog-movie-tunnel-main movie-form-languages input').first().should('have.value', language);
  }

  public addOriginalLanguage() {
    cy.get('catalog-movie-tunnel-main movie-form-languages button').click();
  }

  public fillLastOriginalLanguage(partialLanguage: string, language: string) {
    cy.get('catalog-movie-tunnel-main movie-form-languages input').last().type(partialLanguage);
    cy.get('mat-option').contains(language).click();
  }

  public assertLastOriginalLanguageExists(language: string) {
    cy.get('catalog-movie-tunnel-main movie-form-languages input').last().should('have.value', language);
  }

  // Genre

  public selectGenre(genre: string) {
    cy.get('catalog-movie-tunnel-main movie-form-genre mat-select').click();
    cy.get('catalog-movie-tunnel-main movie-form-genre mat-option').contains(genre).click();
  }

  public assertGenreExists(genre: string) {
    cy.get('catalog-movie-tunnel-main movie-form-genre mat-select').contains(genre);
  }

  // Runtime

  public fillRuntime(runtime: string) {
    cy.get('catalog-movie-tunnel-main movie-form-total-runtime input').type(runtime);
  }

  public assertRuntimeExists(runtime: string) {
    cy.get('catalog-movie-tunnel-main movie-form-total-runtime input').should('have.value', runtime);
  }

  // Festival

  public fillFirstFestivalName(name: string) {
    cy.get('catalog-movie-tunnel-main movie-form-festival-prizes input[test-id=name]').first().type(name);
  }

  public assertFirstFestivalNameExists(name: string) {
    cy.get('catalog-movie-tunnel-main movie-form-festival-prizes input[test-id=name]').first().should('have.value', name);
  }

  public fillFirstFestivalAwardSelection(name: string) {
    cy.get('catalog-movie-tunnel-main movie-form-festival-prizes input[test-id=award]').first().type(name);
  }

  public assertFirstFestivalAwardSelectionExists(name: string) {
    cy.get('catalog-movie-tunnel-main movie-form-festival-prizes input[test-id=award]').first().should('have.value', name);
  }

  public fillFirstFestivalYear(year: string) {
    cy.get('catalog-movie-tunnel-main movie-form-festival-prizes input[test-id=year]').first().type(year);
  }

  public assertFirstFestivalYearExists(year: string) {
    cy.get('catalog-movie-tunnel-main movie-form-festival-prizes input[test-id=year]').first().should('have.value', year);
  }

  public selectFirstFestivalPremiere(name: string) {
    cy.get('catalog-movie-tunnel-main movie-form-festival-prizes mat-button-toggle-group')
      .first().get('mat-button-toggle').contains(name).click();
  }

  public assertFirstFestivalPremiereIsSelected(name: string) {
    cy.get('catalog-movie-tunnel-main movie-form-festival-prizes mat-button-toggle-group')
      .first().get('mat-button-toggle').contains(name).should('have.attr', 'aria-pressed', 'true');
  }

  public addFestival() {
    cy.get('catalog-movie-tunnel-main movie-form-festival-prizes button[test-id=add]').click();
  }

  public fillLastFestivalName(name: string) {
    cy.get('catalog-movie-tunnel-main movie-form-festival-prizes input[test-id=name]').last().type(name);
  }

  public assertLastFestivalNameExists(name: string) {
    cy.get('catalog-movie-tunnel-main movie-form-festival-prizes input[test-id=name]').last().should('have.value', name);
  }

  public fillLastFestivalAwardSelection(name: string) {
    cy.get('catalog-movie-tunnel-main movie-form-festival-prizes input[test-id=award]').last().type(name);
  }

  public assertLastFestivalAwardSelectionExists(name: string) {
    cy.get('catalog-movie-tunnel-main movie-form-festival-prizes input[test-id=award]').last().should('have.value', name);
  }

  public fillLastFestivalYear(year: string) {
    cy.get('catalog-movie-tunnel-main movie-form-festival-prizes input[test-id=year]').last().type(year);
  }

  public assertLastFestivalYearExists(year: string) {
    cy.get('catalog-movie-tunnel-main movie-form-festival-prizes input[test-id=year]').last().should('have.value', year);
  }
}
