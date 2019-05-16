/// <reference types="cypress" />

import { LandingPage } from './landing.po';
import { MovieTeamWorkPage } from './movie-teamwork.po';
import { DeliveryTeamWorkPage } from './delivery-teamwork.po';
import { HomePage } from './home.po';
import { EditProfilePage } from './edit-profile.po';

export class NavbarPage {
  constructor() {
    cy.get('.account-icon', { timeout: 60000 }).contains('account_circle');
  }

  public openLogout() {
    cy.get('button').contains('account_circle').click();
  }

  public clickLogout() {
    cy.get('button').contains('Logout').click();
    return new LandingPage();
  }

  public clickHome() {
    cy.get('mat-icon[svgicon=delivery_white]').click();
    return new HomePage();
  }

  public clickAcceptInvitationToMovie() {
    cy.get('button').contains('Accept').last().click();
    return new MovieTeamWorkPage();
  }

  public clickAcceptInvitationToDelivery() {
    cy.get('button').contains('Accept').first().click();
    return new DeliveryTeamWorkPage();
  }

  public openNotifications() {
    cy.wait(2000);
    cy.get('.notification-button').click();
  }

  public openUserMenu() {
    cy.get('mat-icon').should('contain', 'account_circle').contains('account_circle').click();
  }

  public clickProfile() {
    cy.get('mat-list button').should('contain', 'Profile').contains('Profile').click();
    return new EditProfilePage();
  }
}
