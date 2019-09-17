import NavbarPage from "./NavbarPage";
import MovieEditPage from "./MovieEditPage";
import TemplateListPage from "./TemplateListPage";
import DeliveryListPage from "./DeliveryListPage";
import AddMovieModal from "./AddMovieModal";
import StarterPickerPage from "./delivery-create-tunnel/StarterPickerPage";
import MoviePickerPage from "./delivery-create-tunnel/MoviePickerPage";

export default class HomePage extends NavbarPage {
  constructor() {
    super();
    cy.get('[page-id=movie-list]', {timeout: 10000});
  }

  public clickAddMovie(): AddMovieModal {
    cy.get('[page-id=movie-home] a[test-id=add-movie]').click();
    return new AddMovieModal()
  }

  public clickOnMovieWithNoDeliveries(movieName: string): StarterPickerPage {
    cy.get('[page-id=movie-home] mat-card-title').contains(movieName).parent().click();
    return new StarterPickerPage();
  }

  public clickOnMovieWithDeliveries(movieName: string): DeliveryListPage {
    cy.get('[page-id=movie-home] mat-card-title').contains(movieName).parent().click();
    return new DeliveryListPage();
  }

  public selectAddDeliveryTab(): MoviePickerPage {
    cy.get('[page-id=navbar] .mat-tab-links').get('a').contains('add a delivery').click();
    return new MoviePickerPage();
  }

  public assertMovieExists(movieName: string) {
    cy.contains(movieName).should('have.length', 1);
  }

  public assertMovieNotExists(movieName: string) {
    cy.contains(movieName).should('have.length', 0);
}

  public clickOnMovie(movieName: string) {
    cy.get('[page-id=movie-list] mat-card').contains(movieName).parent().click();
    return new DeliveryListPage();
  }

  public displayMovieMenu(movieName: string) {
    cy.get('[page-id=movie-home] div').contains(movieName).parent().find('button').click();
  }

  public clickOpenIn() {
    cy.get('[page-id=movie-home] button span').should('contain', 'Open in...').contains('Open in...').click();
  }

  public clickEdit() {
    cy.get('[page-id=movie-home] button').should('contain', 'Edit').contains('Edit').click();
    return new MovieEditPage();
  }

  public clickDelete() {
    cy.get('[page-id=movie-home] button').should('contain', 'Delete').contains('Delete').click();
  }

  public selectTemplates() {
    cy.get('[page-id=navbar] .mat-tab-links').get('a').contains('templates').click();
    return new TemplateListPage();
  }
}
