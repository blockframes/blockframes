import {
  MovieListPage,
  OrganizationEditablePage,
  MemberEditablePage,
  LoginViewPage,
  TemplateListPage,
  TemplateCreatePage,
  ProfileEditablePage,
  DeliveryInformationsEditablePage,
  DeliveryStakeholdersPage,
  DeliveryEditablePage
} from './index';

export default abstract class NavbarPage {
  constructor() {
    cy.get('[page-id=navbar]', { timeout: 10000 });
  }

  public clickHome() {
    cy.get('[page-id=navbar] button[test-id=home]').click();
    return new MovieListPage();
  }

  ////////////////////
  /// Profile Menu ///
  ////////////////////

  public openProfileMenu() {
    cy.get('[page-id=navbar]')
      .get('button[test-id=profile-avatar]')
      .click();
  }

  public clickProfile() {
    cy.get('button[test-id=profile]').click();
    return new ProfileEditablePage();
  }

  public clickLogout() {
    this.openProfileMenu();
    cy.get('button[test-id=logout]').click();
    return new LoginViewPage();
  }

  public clickOnOrganization() {
    cy.get('button[test-id=manage-organization]').click();
    return new OrganizationEditablePage();
  }

  /////////////////////
  /// Notifications ///
  /////////////////////

  public acceptInvitation(message: string): MovieListPage {
    this.openNotifications();
    this.clickAccept(message);
    return new MovieListPage();
  }

  public navigateToDocument(): DeliveryEditablePage {
    this.openNotifications();
    this.clickGoToDocument();
    return new DeliveryEditablePage();
  }

  public clickGoToDocument() {
    cy.get('notification-item').contains('Go to document').click();
  }

  public openNotifications() {
    cy.get('notification-widget').click();
  }

  public clickAccept(message: string) {
    cy.get('invitation-item a[test-id=accept]').click();
  }

  ////////////////////
  /// Context Menu ///
  ////////////////////

  public clickContextMenuMember() {
    cy.get('[page-id=navbar] a')
      .contains('member')
      .click();
    return new MemberEditablePage();
  }

  public clickContextMenuTemplates() {
    cy.get('[page-id=navbar] a')
      .contains('templates')
      .click();
    return new TemplateListPage();
  }

  // Delivery view

  public clickContextMenuInformation(): DeliveryInformationsEditablePage {
    cy.get('[page-id=navbar] a')
      .contains('information')
      .click();
    return new DeliveryInformationsEditablePage();
  }

  clickContextMenuStakeholders(): DeliveryStakeholdersPage {
    cy.get('[page-id=navbar] a')
      .contains('stakeholders')
      .click();
    return new DeliveryStakeholdersPage();
  }

  public clickContextMenuTemplatesCreate() {
    cy.get('[page-id=navbar] a')
      .contains('templates')
      .click();
    return new TemplateCreatePage();
  }
}
