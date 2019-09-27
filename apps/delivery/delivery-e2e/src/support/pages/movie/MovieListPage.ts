import NavbarPage from "../NavbarPage";
import DeliveryListPage from "../delivery/DeliveryListPage";
import MovieTitleFormModal from "./MovieTitleFormModal";
import StarterPickerPage from "../delivery-create-tunnel/StarterPickerPage";
import MoviePickerPage from "../delivery-create-tunnel/MoviePickerPage";

export default class MovieListPage extends NavbarPage {
  constructor() {
    super();
    cy.get('[page-id=movie-list]', {timeout: 10000});
  }

  public clickAddMovie(): MovieTitleFormModal {
    cy.get('[page-id=movie-list] a[test-id=add-movie]').click();
    return new MovieTitleFormModal()
  }

  public clickOnMovieWithNoDeliveries(movieName: string): StarterPickerPage {
    cy.get('[page-id=movie-list] mat-card').contains('mat-card', movieName).click();
    return new StarterPickerPage();
  }

  public clickOnMovieWithDeliveries(movieName: string): DeliveryListPage {
    cy.get('[page-id=movie-list] mat-card').contains('mat-card', movieName).click();
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

  public clickDelete() {
    cy.get('[page-id=movie-list] button').should('contain', 'Delete').contains('Delete').click();
  }
}
