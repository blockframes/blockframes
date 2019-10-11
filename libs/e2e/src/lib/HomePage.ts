import { NewMoviePage } from './NewMoviePage';

export class HomePage {
  constructor() {
    // TODO: assert it's the right page
  }

  clickNewMovie(): any {
    cy.get('button').click({ force: true });
    return new NewMoviePage();
  }

  findMovieItemByTitle(title: string) {
    cy.get('mat-card-title').contains(title);
  }
}
