/// <reference types="cypress" />

import { TemplateListPage } from "./template-list.po";

export class AddTemplateModal {
  constructor() {
    cy.contains('Add a new template');
  }

  public fillTemplateName(name: string) {
    cy.get('input[placeholder="New template name"]').type(name);
  }

  public clickCreate() {
    cy.get('button').contains('Create').click();
    return new TemplateListPage();
  }
}
