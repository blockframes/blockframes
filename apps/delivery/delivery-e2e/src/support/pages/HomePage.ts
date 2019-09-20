import NavbarPage from "./NavbarPage";
import MovieEditablePage from "./movie/MovieEditablePage";
import TemplateListPage from "./template/TemplateListPage";
import DeliveryListPage from "./delivery/DeliveryListPage";
import MovieTitleFormModal from "./movie/MovieTitleFormModal";
import StarterPickerPage from "./delivery-create-tunnel/StarterPickerPage";
import MoviePickerPage from "./delivery-create-tunnel/MoviePickerPage";

export default class HomePage extends NavbarPage {
  constructor() {
    super();
    cy.get('[page-id=movie-list]', {timeout: 10000});
  }

  public clickAddMovie(): MovieTitleFormModal {
    cy.get('[page-id=movie-list] a[test-id=add-movie]').click();
    return new MovieTitleFormModal()
  }

  public clickOnMovieWithNoDeliveries(movieName: string): StarterPickerPage {
    cy.get('[page-id=movie-list] mat-card-title').contains(movieName).parent().click();
    return new StarterPickerPage();
  }

  public clickOnMovieWithDeliveries(movieName: string): DeliveryListPage {
    cy.get('[page-id=movie-list] mat-card-title').contains(movieName).parent().click();
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
    cy.get('[page-id=movie-list] mat-card').contains(movieName).parent().parent().parent().parent().click();
    return new DeliveryListPage();
  }

  public displayMovieMenu(movieName: string) {
    cy.get('[page-id=movie-list] div').contains(movieName).parent().find('button').click();
  }

  public clickOpenIn() {
    cy.get('[page-id=movie-list] button span').should('contain', 'Open in...').contains('Open in...').click();
  }

  public clickEdit() {
    cy.get('[page-id=movie-list] button').should('contain', 'Edit').contains('Edit').click();
    return new MovieEditablePage();
  }

  public clickDelete() {
    cy.get('[page-id=movie-list] button').should('contain', 'Delete').contains('Delete').click();
  }

  public selectTemplates() {
    cy.get('[page-id=navbar] .mat-tab-links').get('a').contains('templates').click();
    return new TemplateListPage();
  }
}
