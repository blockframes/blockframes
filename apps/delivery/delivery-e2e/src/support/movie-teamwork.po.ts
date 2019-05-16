/// <reference types="cypress" />

import { HomePage } from "./home.po";

export class MovieTeamWorkPage {
  constructor() {
  }

  public clickHome() {
    cy.get('a').contains('home').click();
    return new HomePage;
  }
}
