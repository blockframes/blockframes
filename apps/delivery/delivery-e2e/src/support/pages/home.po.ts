/// <reference types="cypress" />

import { NavbarPage } from "./navbar.po";
import { DeliveryListPage } from "./delivery-list.po";
import { TemplateListPage } from "./template-list.po";

export class HomePage extends NavbarPage {
  constructor() {
    super();
    // TODO: check if we are on a home page
  }

  public clickOnMovie(movieName: string) {
    cy.wait(2000);
    cy.get('mat-card').contains(movieName).click();
    return new DeliveryListPage();
  }

  public displayMovieMenu(movieName: string) {
    cy.wait(2500);
    cy.get('mat-card-title').contains(movieName).parent().parent().parent().find('button mat-icon').should('contain', 'more_vert').contains('more_vert').click();
  }

  public clickOpenIn() {
    cy.get('button span').should('contain', 'Open in...').contains('Open in...').click();
  }

  public selectApp() {
    cy.get('button').should('contain', 'Current app').contains('Current app').click();
    return new DeliveryListPage();
  }

  public selectTemplates() {
    cy.get('.mat-tab-links').get('a').contains('templates').click();
    return new TemplateListPage();
  }
}
