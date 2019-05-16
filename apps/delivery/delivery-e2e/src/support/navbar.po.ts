/// <reference types="cypress" />

import { LandingPage } from './landing.po';
import { MovieTeamWorkPage } from './movie-teamwork.po';
import { DeliveryTeamWorkPage } from './delivery-teamwork.po';

export class NavbarPage {
  constructor() {
    cy.get('.account-icon', { timeout: 60000 }).contains('account_circle');
  }

  public openNotifications() {
    cy.wait(2000);
    cy.get('.notification-button').click();
  }

  public clickAcceptInvitationToMovie() {
    cy.get('button')
      .contains('Accept')
      .first()
      .click();
    return new MovieTeamWorkPage();
  }

  public clickAcceptInvitation() {
    cy.get('button').contains('Accept').first().click();
    return new DeliveryTeamWorkPage;
}

  public openLogout() {
    cy.get('button')
      .contains('account_circle')
      .click();
  }

  public clickLogout() {
    cy.get('button')
      .contains('Logout')
      .click();
    return new LandingPage();
  }
}
