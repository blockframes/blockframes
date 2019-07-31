export default class HomePage {
  constructor() {
    // TODO#704: check if we are on a home page
  }

  public assertMovieNotExists(movieName: string) {
    cy.contains(movieName).should('have.length', 0);
}

  public assertOrgExists(orgName: string) {
    cy.wait(2000);
    cy.get('mat-expansion-panel').contains(orgName);
  }


  public displayMovieMenu(movieName: string) {
    cy.wait(2500);
    cy.get('mat-card-title').contains(movieName).parent().parent().parent().find('button mat-icon').should('contain', 'more_vert').contains('more_vert').click();
  }

  public clickOpenIn() {
    cy.get('button span').should('contain', 'Open in...').contains('Open in...').click();
  }

}
