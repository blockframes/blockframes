import MovieEditablePage from "./MovieEditablePage";

export default class MovieTitleFormModal {
  constructor() {
    cy.get('[page-id=movie-title-form]', {timeout: 10000});
  }

  public fillMovieName(movieName: string) {
    cy.get('[page-id=movie-title-form] input[test-id=movie-name]').type(movieName);
  }

  public clickCreate() {
    cy.get('[page-id=movie-title-form]').get('button[test-id=movie-create]').click();
    cy.wait(1000);
    return new MovieEditablePage();
  };
}
