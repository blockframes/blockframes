import StarterPickerPage from "./StarterPickerPage";

export default class MoviePickerPage {
  constructor() {
    cy.get('[page-id=movie-picker]');
  }

  public pickMovie(movieName: string): StarterPickerPage {
    cy.get('mat-card').contains(movieName).click();
    return new StarterPickerPage();
  }

}
