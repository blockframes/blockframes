import { HomePage, OrganizationFormPage, LandingPage, ViewProfilePage, MovieTeamWorkPage, DeliveryTeamWorkPage } from ".";

export default abstract class NavbarPage {
  constructor() {
  }

  public assertIsEncrypting() {
    cy.get('mat-chip').contains('ENCRYPTING');
  }

  public clickOnOrganization(orgName: string) {
    cy.get('button').contains(orgName).click();
    return new OrganizationFormPage();
  }

  public openLogout() {
    cy.get('mat-toolbar button.profile-button').click();
  }

  public clickLogout() {
    cy.get('button[testId=logout]').click();
    return new LandingPage();
  }

  public clickHome() {
    cy.get('button[testId=home]').click();
    return new HomePage();
  }

  public clickAcceptInvitationToMovie() {
    cy.get('div[testId=notifications] button.mat-primary').first().click();
    return new MovieTeamWorkPage();
  }

  public clickAcceptInvitationToDelivery() {
    cy.get('div[testId=notifications] button.mat-primary').first().click();
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
    cy.get('button[testId=buttonProfile]').click();
    return new ViewProfilePage();
  }
}
