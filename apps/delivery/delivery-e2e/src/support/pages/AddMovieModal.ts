import MovieEditPage from "./MovieEditPage";

export default class AddMovieModal {
  constructor() {}

  public fillMovieName(movieName: string) {
    cy.get('mat-dialog-container').find('input').type(movieName);
  }

  public clickCreate() {
    cy.get('[page-id=movieCreate]').get('button[test-id=movieCreate]').click();
    cy.wait(1000);
    return new MovieEditPage();
  };
}
