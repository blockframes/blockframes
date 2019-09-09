import { HomePage, OrganizationFormPage, LandingPage, ViewProfilePage, MovieTeamWorkPage, DeliveryTeamWorkPage, LoginPage } from ".";

export default abstract class NavbarPage {
  constructor() {
    cy.get('[page-id=navbar]');
  }

  public assertIsEncrypting() {
    cy.get('mat-chip').contains('ENCRYPTING');
  }

  public clickOnOrganization(orgName: string) {
    cy.get('button').contains(orgName).click();
    return new OrganizationFormPage();
  }

  public openProfileMenu() {
    cy.get('[page-id=navbar]').get('button[test-id=profile-avatar]').click();
  }

  public logout() {
    this.openProfileMenu();
    cy.get('button[test-id=logout]').click();
    return new LoginPage();
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

  public clickProfile() {
    cy.get('button[testId=buttonProfile]').click();
    return new ViewProfilePage();
  }
}
