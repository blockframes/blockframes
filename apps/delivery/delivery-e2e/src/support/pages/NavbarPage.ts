import { HomePage, OrganizationEditablePage, MemberEditablePage, LoginViewPage, TemplateListPage, TemplateCreatePage, EditProfilePage } from "./index";

export default abstract class NavbarPage {
  constructor() {
    cy.get('[page-id=navbar]', { timeout: 10000 });
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
    return new LoginViewPage();
  }

  public clickHome() {
    cy.get('[page-id=navbar] button[test-id=home]').click();
    return new HomePage();
  }

  public openNotifications() {
    cy.wait(2000);
    cy.get('.notification-button').click();
  }

  public clickProfile() {
    cy.get('button[testId=buttonProfile]').click();
    return new EditProfilePage();
  }

  public clickContextMenuMember() {
    cy.get('[page-id=navbar]').contains('member').click();
    return new MemberEditablePage();
  }

  public clickContextMenuTemplates() {
    cy.get('[page-id=navbar]').contains('templates').click();
    return new TemplateListPage();
  }

  public clickOnOrganization() {
    cy.get('button[test-id=manage-organization]').click();
    return new OrganizationEditablePage();
  }

  public clickContextMenuTemplatesCreate() {
    cy.get('[page-id=navbar]').contains('templates').click();
    return new TemplateCreatePage();
  }
}
