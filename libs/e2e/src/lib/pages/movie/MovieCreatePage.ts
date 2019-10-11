import NavbarPage from "../NavbarPage";
import MovieTitleFormModal from "./MovieTitleFormModal";

export default class MovieCreatePage extends NavbarPage {
  constructor() {
    super();
    cy.get('[page-id=movie-create]', {timeout: 10000})
  }

  public clickAddMovie() {
    cy.get('[page-id=movie-create] button[test-id=movieAdd]').should('contain', 'Add a movie').click();
    return new MovieTitleFormModal();
  }
}
