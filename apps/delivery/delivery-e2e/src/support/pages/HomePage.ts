import NavbarPage from "./NavbarPage";
import OrganizationFormPage from "./OrganizationFormPage";
import MovieEditPage from "./MovieEditPage";
import TemplateListPage from "./TemplateListPage";
import DeliveryListPage from "./DeliveryListPage";
import AddMovieModal from "./AddMovieModal";

export default class HomePage extends NavbarPage {
  constructor() {
    super();
  }

  public clickAddMovie() {
    cy.get('[page-id=movie-home] a[test-id=add-movie]').click();
    return new AddMovieModal()
  }

  public assertMovieExists(movieName: string) {
    cy.contains(movieName).should('have.length', 1);
  }

  public assertMovieNotExists(movieName: string) {
    cy.contains(movieName).should('have.length', 0);
}

  public assertOrgExists(orgName: string) {
    cy.wait(2000);
    cy.get('mat-expansion-panel').contains(orgName);
  }

  public clickCreateAnOrganization() {
    cy.get('[testId=home-empty]').find('button').click();
    return new OrganizationFormPage();
  }

  public clickOnMovie(movieName: string) {
    cy.wait(3000);
    cy.get('mat-card').contains(movieName).click();
    return new DeliveryListPage();
  }

  public displayMovieMenu(movieName: string) {
    cy.get('div').contains(movieName).parent().find('button').click();
  }

  public clickOpenIn() {
    cy.get('button span').should('contain', 'Open in...').contains('Open in...').click();
  }

  public selectApp() {
    cy.get('button').should('contain', 'Current app').contains('Current app').click();
    return new DeliveryListPage();
  }

  public clickEdit() {
    cy.get('button').should('contain', 'Edit').contains('Edit').click();
    return new MovieEditPage();
  }

  public clickDelete() {
    cy.get('button').should('contain', 'Delete').contains('Delete').click();
  }

  public selectTemplates() {
    cy.wait(500);
    cy.get('.mat-tab-links').get('a').contains('templates').click();
    return new TemplateListPage();
  }
}
