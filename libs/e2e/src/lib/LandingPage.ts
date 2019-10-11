import { LandingWithModalPage } from './LandingWithModalPage';

export class LandingPage {
  public clickConnection(): any {
    cy.contains('Connexion').click();
    return new LandingWithModalPage();
  }
}
