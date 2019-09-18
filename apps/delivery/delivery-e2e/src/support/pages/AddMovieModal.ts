import MovieEditPage from "./MovieEditPage";

export default class AddMovieModal {
  constructor() {
    cy.get('[page-id=movie-create]', {timeout: 10000});
  }

  public fillMovieName(movieName: string) {
    cy.get('[page-id=movie-create] input[test-id=movie-name]').type(movieName);
  }

  public clickCreate() {
    cy.get('[page-id=movie-create]').get('button[test-id=movie-create]').click();
    cy.wait(1000);
    return new MovieEditPage();
  };
}
