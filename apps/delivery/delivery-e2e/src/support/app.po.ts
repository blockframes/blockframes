/// <reference types="cypress" />
/* tslint:disable:no-use-before-declare */

export const getGreeting = () => cy.get('h1');

export const getTitle = () => cy.get('section h1');

export class NavbarPage {
  constructor() {
    cy.get('header', {timeout: 60000}).contains('Blockframes');
  }

  public openUserMenu() {
    cy.get('mat-icon').should('contain', 'account_circle').contains('account_circle').click();
  }

  public clickProfile() {
    cy.get('mat-list button').should('contain', 'Profile').contains('Profile').click();
    return new EditProfilePage;
  }
}
export class TemplateFormPage {
  constructor() {
    cy.contains('Add new material')
  }

  public assertMaterialsExist(materialsLength: number) {
    cy.get('mat-card mat-card').should('have.length', materialsLength);
  }

  public selectTemplate() {
    cy.get('.mat-tab-links').get('a').contains('templates').click();
    return new TemplateListPage();
  }
}

export class TeamWorkPage {
  constructor() {}

    public clickAddStakeholder(name: string) {
      cy.wait(500);
      cy.get('mat-card.mat-elevation-z0')
      .should('contain', name)
      .contains(name).parent().parent()
      .find('button').click();
    }

    public clickDelivery() {
      cy.get('a').contains('delivery').click();
      return new DeliveryFormPage;
    }
  }


export class DeliverySettingsFormPage {
  constructor() {
  }
  public openGeneralDate() {
    cy.get('mat-datepicker-toggle button.mat-icon-button').click();
  }

  public clickGeneralDate(date: string) {
    cy.contains(date).click();
  }

  public clickCreateStep() {
    cy.get('button.create-step').click();
  }

  public fillStepName(stepName: string) {
    cy.get('input.stepName').type(stepName);
  }

  public openStepDate() {
    cy.get('mat-form-field.stepDate button.mat-icon-button').click();
  }

  public clickStepDate(date: string) {
    cy.contains(date).click();
  }

  public clickSaveStep() {
    cy.get('button.add-button').click();
  }

  public clickTeamWork() {
    cy.contains('team-work').click();
    return new TeamWorkPage;
  }
}

export class NewTemplatePage {
  constructor() {
    cy.contains('Save as a new template');
  }

  public clickSelect() {
    cy.get('mat-select').click();
  }

  public pickOrganization(orgName: string) {
    cy.get('mat-option').contains(orgName).click();
  }

  public fillName(templateName: string) {
    cy.get('input').type(templateName);
  }

  public clickSave() {
    cy.get('button').contains('Save Template').click();
    return new DeliveryFormPage();
  }
}

export class DeliveryFormPage {
  constructor() {
    cy.get('.delivery-form').should('contain', 'Sign delivery');
  }

  public verifyDeletedMaterial(value: string) {
    cy.get('mat-card').contains(value).should('have.length', 0);
  }

  public verifySignatures() {
    cy.get('mat-card-footer.footerSigned').should((footers) => {
      expect(footers).to.have.length(2) });
  }

  public clickSign() {
    cy.get('button').contains('Sign').click();
    cy.wait(3000);
  }

  public fillPassword(password: string) {
    cy.get('input.password').type(password);
  }

  public clickVerifyToSign() {
    cy.get('button').contains('Verify to sign').click();
  }

  public clickAddSignature() {
    cy.get('button').contains('Add signature').click();
  }

  public clickDeleteMaterial(value: string) {
    cy.wait(1000);
    cy.get('mat-card')
    .contains(value)
    .parent().parent()
    .find('button').contains('DELETE').click();
  }

  public openLogout() {
    cy.get('button').contains('account_circle').click();
  }

  public clickLogout() {
    cy.get('button').contains('Logout').click();
    return new LandingPage;
  }

  public clickCheckBoxMaterial(name: string) {
    cy.get('mat-card')
      .contains(name)
      .parent().parent()
      .find('mat-checkbox [type="checkbox"]').check({force: true});
  }

  public clickCheckBoxMaterials(names: string[]) {
    cy.wait(1000);
    names.forEach(name => this.clickCheckBoxMaterial(name));
  }

  public scrollToAction() {
    cy.get('button.action').scrollIntoView();
  }

  public clickButtonAction() {
    cy.get('button.action').click();
  }

  public clickChangeStep() {
    cy.get('button').contains('Change step').click();
  }

  public clickAddStep(stepName: string) {
    cy.get('button').contains(stepName).click();
  }

  public clickAdd() {
    cy.get('mat-sidenav button.create-material').click();
  }

  public fillValue(materialValue: string) {
    cy.get('input.value').type(materialValue);
  }

  public fillDescription(materialDescription: string) {
    cy.get('input.description').type(materialDescription);
  }

  public fillCategory(materialCategory: string) {
    cy.get('input.category').type(materialCategory);
  }

  public clickSaveMaterial() {
    cy.get('button.add-button').click();
  }

  public clickSaveAsTemplate() {
    cy.get('button').contains('Save as new template').click();
    return new NewTemplatePage();
  }

  public selectDeliveries() {
    cy.get('.mat-tab-links').get('a').contains('deliveries').click();
    return new DeliveryListPage();
  }

  public assertMaterialsExist(materialsLength: number) {
    cy.get('mat-card mat-card').should('have.length', materialsLength);
  }

  public deleteDelivery() {
    cy.get('button').contains('Delete delivery').click();
    return new DeliveryListPage();
  }
}

export class TemplatePickerPage {
  constructor() {
    cy.contains('Blank');
  }

  public clickCreateNewDelivery() {
    cy.get('span.blank', {timeout: 500}).click();
    return new DeliverySettingsFormPage();
  }

  public clickTemplateDelivery(templateName: string) {
    cy.wait(1500);
    cy.get('.ng-star-inserted > .mat-card')
      .contains(templateName).click();
    return new DeliverySettingsFormPage();
  }
}

export class DeliveryListPage {
  constructor() {
    cy.contains('deliveries');
  }

  public clickDeliveries() {
    cy.get('a').contains('deliveries').click();
  }

  public clickAddDelivery() {
    cy.get('button.add-delivery').click();
    return new TemplatePickerPage();
  }

  public assertDeliveryExists() {
    cy.get('.delivery-card').should('have.length', 1);
  }

  public clickDelivery() {
    cy.get('.delivery-card').first().click();
    return new DeliveryFormPage();
  }

  public assertDeliveryIsDeleted() {
    cy.get('.delivery-card').should('have.length', 0);
  }

  public selectTemplate() {
    cy.get('.mat-tab-links').get('a').contains('templates').click();
    return new TemplateListPage();
  }
}

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

export class TemplateListPage {
  constructor() {
    cy.contains('templates');
  }

  public createTemplate() {
    cy.get('button').contains('Add Template').click();
    return new AddTemplateModal();
  }

  public assertTemplateExists(templateName: string) {
    cy.get('mat-card-title').contains(templateName).should('have.length', 1);
  }

  public displayTemplateMenu(templateName: string) {
    cy.get('mat-card').contains(templateName).parent('mat-card').find('button.trigger').click({force: true});
  }

  public clickEdit() {
    cy.get('span').contains('Edit').click({force: true});
    return new TemplateFormPage();
  }

  public openExpansionPanel(orgName: string) {
    cy.get('.mat-expansion-panel-header-title').contains(orgName).click();
  }

  public deleteTemplate() {
    cy.get('span').contains('Delete').click({force: true});
  }

  public selectHome() {
    cy.get('.mat-tab-links').get('a').contains('home').click();
    return new HomePage();
  }


  public assertTemplateIsDeleted(templateName: string) {
    cy.get('.template-item').contains(templateName).should('have.length', 0);
  }
}

export class HomePage extends NavbarPage {
  constructor() {
    super();
    // TODO: check if we are on a home page
  }

  public openNotifications() {
    cy.wait(2000);
    cy.get('.notifications').click();
  }

  public clickAcceptInvitation() {
    cy.get('button').contains('Accept').first().click();
    return new TeamWorkPage;
  }

  public clickOnMovie(movieName: string) {
    cy.get('mat-card').contains(movieName).click();
    return new DeliveryListPage();
  }

  public displayMovieMenu(movieName: string) {
    cy.wait(2500);
    cy.get('mat-card-title').contains(movieName).parent().parent().parent().find('button mat-icon').should('contain', 'more_vert').contains('more_vert').click();
  }

  public clickOpenIn() {
    cy.get('button span').should('contain', 'Open in...').contains('Open in...').click();
  }

  public selectApp() {
    cy.get('button').should('contain', 'Current app').contains('Current app').click();
    return new DeliveryListPage();
  }

  public selectTemplates() {
    cy.get('.mat-tab-links').get('a').contains('templates').click();
    return new TemplateListPage();
  }
}

export class EditProfilePage {
  constructor() {
    cy.get('mat-card-header').contains('Edit account');
  }

  public wait(time: number) {
    cy.wait(time);
  }

  public assertIdIsAddress() {
    cy.get('label').first().contains('Id');

    cy.get('#mat-input-5', {timeout: 60000}).should(($input) => {
      expect($input.val()).to.match(/0x[a-zA-Z\d]{40}/); // ethereum address regex
    });
  }
}

export class LandingPage {
  constructor() {
    cy.contains('Sign in');
  }

  public fillSigninEmail(email: string) {
    cy.get('#signin input[type="email"]').type(email);
  }

  public fillSigninPassword(password: string) {
    cy.get('#signin input[type="password"]').type(password);
  }

  public login(): any {
    cy.get('button').contains('Signin').click();
    return new HomePage();
  }

  public fillSignupEmail(email: string) {
    cy.get('#signup input[type="email"]').type(email);
  }

  public fillSignupPassword(password: string) {
    cy.get('#signup input[type="password"]').eq(0).type(password);
    cy.get('#signup input[type="password"]').eq(1).type(password);
  }

  public signup(): any {
    cy.get('button').contains('Signup').click();
    return new HomePage();
  }
}
