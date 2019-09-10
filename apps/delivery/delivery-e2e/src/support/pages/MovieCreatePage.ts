import NavbarPage from "./NavbarPage";
import AddMovieModal from "./AddMovieModal";

export default class HomePage extends NavbarPage {
  constructor() {
    super();
  }

  public clickAddMovie() {
    cy.get('button[test-id=movieAdd]').should('contain', 'Add a movie').click();
    return new AddMovieModal();
  }

}
