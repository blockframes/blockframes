import { HomePage, ViewProfilePage, DeliveryTeamWorkPage, LoginPage, OrganizationMemberPage } from ".";

export default abstract class NavbarPage {
  constructor() {
    cy.wait(5000);
    cy.get('[page-id=navbar]');
  }

  public assertIsEncrypting() {
    cy.get('mat-chip').contains('ENCRYPTING');
  }

  public openProfileMenu() {
    cy.get('[page-id=navbar]').get('button[test-id=profile-avatar]').click();
  }

  public clickLogout() {
    this.openProfileMenu();
    cy.get('button[test-id=logout]').click();
    return new LoginPage();
  }

  public clickHome() {
    cy.get('button[testId=home]').click();
    return new HomePage();
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

    public clickContextMenuMember() {
    cy.get('[page-id=navbar]').contains('member').click();
    return new OrganizationMemberPage();
  }
}
