/// <reference types="cypress" />

import { TemplateListPage } from "./template-list.po";

export class TemplateFormPage {
  constructor() {
    cy.contains('Add a material')
  }

  public   assertMaterialsCount(materialsLength: number) {
    cy.get('mat-card').should('have.length', materialsLength);
  }

  public selectTemplates() {
    cy.get('a').contains('templates').click();
    return new TemplateListPage;
  }
}
