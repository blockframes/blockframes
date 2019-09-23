import { MovieListPage, OrganizationEditablePage, MemberEditablePage, LoginViewPage, TemplateListPage, TemplateCreatePage, ProfileEditablePage, DeliveryListPage, DeliveryInformationsEditablePage } from "./index";

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
    cy.get('[page-id=navbar]').get('button[test-id=profile-avatar]').click();
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

  ////////////////////
  /// Context Menu ///
  ////////////////////

  public clickContextMenuMember() {
    cy.get('[page-id=navbar] a').contains('member').click();
    return new MemberEditablePage();
  }

  public clickContextMenuTemplates() {
    cy.get('[page-id=navbar] a').contains('templates').click();
    return new TemplateListPage();
  }

  public clickContextMenuInformation(): DeliveryInformationsEditablePage {
    cy.get('[page-id=navbar] a').contains('information').click();
    return new DeliveryInformationsEditablePage();
  }

  public clickContextMenuTemplatesCreate() {
    cy.get('[page-id=navbar] a').contains('templates').click();
    return new TemplateCreatePage();
  }
}
