import TunnelVersionInfoPage from "./TunnelVersionInfoPage";

export default class TunnelBudgetPage {
  constructor() {
    cy.get('catalog-movie-tunnel-budget', { timeout: 5000 });
  }

  public static navigateToPage(movieId: string) {
    cy.visit(`c/o/dashboard/tunnel/movie/${movieId}/budget`);
    return new TunnelBudgetPage();
  }

  public selectBudgetRange(budget: string) {
    cy.get('catalog-movie-tunnel-budget [test-id=budget-range]').click();
    cy.get('mat-option').contains(budget).click();
  }

  public assertBudgetRangeIsSelected(budget: string) {
    cy.get('catalog-movie-tunnel-budget [test-id=budget-range]').contains(budget);
  }

  public selectQuota(quota: string) {
    cy.get('catalog-movie-tunnel-budget movie-form-certifications mat-button-toggle').contains(quota).click();
  }

  public assertQuotaIsSelected(quota: string) {
    cy.get('catalog-movie-tunnel-budget movie-form-certifications mat-button-toggle')
      .contains(quota).should('have.attr', 'aria-pressed', 'true');
  }

  public clickSelectMetric() {
    cy.get('catalog-movie-tunnel-budget movie-form-box-office mat-select').click();
  }

  public selectMetric(metric: string) {
    cy.get('mat-option').contains(metric).click();
  }

  public assertMetricExists(metric: string) {
    cy.get('mat-select').contains(metric);
  }

  public fillBoxOfficeCountry(partialCountry: string) {
    cy.get('catalog-movie-tunnel-budget movie-form-box-office form-country input').type(partialCountry);
  }

  public selectBoxOfficeCountry(country: string) {
    cy.get('mat-option').contains(country).click();
  }

  public assertBoxOfficeCountryExists(country: string) {
    cy.get('catalog-movie-tunnel-budget movie-form-box-office form-country input').should(`have.value`, country);
  }

  public fillBoxOfficeEarnings(earning: string) {
    cy.get('catalog-movie-tunnel-budget movie-form-box-office input[test-id=earnings]').clear().type(earning);
  }

  public assertBoxOfficeEarningsExists(earning: string) {
    cy.get('catalog-movie-tunnel-budget movie-form-box-office input[test-id=earnings]').should('have.value', earning);
  }

  public fillRatingsCountry(partialcountry: string) {
    cy.get('catalog-movie-tunnel-budget movie-form-ratings form-country input').type(partialcountry);
  }

  public selectRatingsCountry(country: string) {
    cy.get('mat-option').contains(country).click();
  }

  public assertRatingsCountry(country: string) {
    cy.get('catalog-movie-tunnel-budget movie-form-ratings form-country input').should('have.value', country);
  }

  public fillRating(rating: string) {
    cy.get('catalog-movie-tunnel-budget movie-form-ratings input[test-id=rating]').type(rating);
  }

  public assertRatingExists(rating: string) {
    cy.get('catalog-movie-tunnel-budget movie-form-ratings input[test-id=rating]').should('have.value', rating);
  }

  public fillJournalName(name: string) {
    cy.get('catalog-movie-tunnel-budget movie-form-review input[test-id=journal]').type(name);
  }

  public assertJournalNameExists(name: string) {
    cy.get('catalog-movie-tunnel-budget movie-form-review input[test-id=journal]').should('have.value', name);
  }

  public fillRevueLink(link: string) {
    cy.get('catalog-movie-tunnel-budget movie-form-review input[test-id=link]').type(link);
  }

  public assertRevueLinkExists(link: string) {
    cy.get('catalog-movie-tunnel-budget movie-form-review input[test-id=link]').should('have.value', link);
  }

  public fillFilmCritic(critic: string) {
    cy.get('catalog-movie-tunnel-budget movie-form-review textarea[test-id=critic]').type(critic);
  }

  public assertFilmCriticExists(critic: string) {
    cy.get('catalog-movie-tunnel-budget movie-form-review textarea[test-id=critic]').should('have.value', critic);
  }

  public clickNext() {
    cy.get('[test-id=next]').click();
    return new TunnelVersionInfoPage();
  }
}
