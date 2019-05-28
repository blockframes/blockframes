/// <reference types="cypress" />
/* tslint:disable:no-use-before-declare */

export const getGreeting = () => cy.get('h1');

export const getTitle = () => cy.get('section h1');

export class NavbarPage {
  constructor() {
    cy.get('.account-icon', {timeout: 60000}).contains('account_circle');
  }

  public assertEncryptingExists() {
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

export class TemplateDeleteModal {
  constructor() {}

  public clickConfirm() {
    cy.get('button[testId=confirm]').click();
    return new TemplateListPage();
  }
}


export class OrganizationFormPage extends NavbarPage {
  constructor() {
    super();
  }

  public clickAdd() {
    cy.get('button[testId=addMember]').click();
  }

  public selectRole(role: string) {
    cy.get('input[formcontrolname=role]').click();
    cy.get('mat-option').contains(role).click();
  }

  public assertEmailValidated(email: string) {
    cy.get('input[formControlName=user]').should(input => {
      expect(input.val()).to.contain(email);
    })
  }

  public fillAndSelectEmail(partialEmail: string, email: string) {
    cy.get('input[formcontrolname=user]').type(partialEmail);
    cy.wait(1000);
    cy.get('input[formcontrolname=user]').click();
    cy.get('mat-option').contains(email).click();
  }

  public assertOrgNameExists(orgName: string) {
    cy.wait(1500);
    cy.get('mat-card-title').contains(orgName);
  }

  public fillOrgName(orgName: string) {
    cy.get('input[formcontrolname=name]').type(orgName);
  }

  public fillOrgAddress(orgAddress: string) {
    cy.get('textarea[formcontrolname=address]').type(orgAddress);
  }

  public clickNext() {
    cy.get('button.mat-primary').click();
    return new HomePage();
  }
}

export class TemplateFormPage {
  constructor() {
    cy.contains('Add a material')
  }

  public deleteTemplate() {
    cy.get('button.delete-template').click();
    return new TemplateDeleteModal();
  }

  public clickDeleteMaterial(value: string) {
    cy.get('mat-card')
    .contains(value)
    .parent().parent()
    .trigger('mouseover')
    .find('button').contains('DELETE').click({force: true});
  }

  public clickEditMaterial(value: string) {
    cy.get('mat-card')
    .contains(value)
    .parent().parent()
    .trigger('mouseover')
    .find('button').contains('EDIT').click({force: true});
  }

  public assertMaterialExists(value: string, description: string, category: string) {
    cy.get('mat-card').should((card) => expect(card).to.contain(value).to.contain(description));
    cy.get('h3').contains(category).should('have.length', '1');
  }

  public clickAdd() {
    cy.get('mat-sidenav button.create-material').click();
  }

  public fillValue(materialValue: string) {
    cy.get('input.value').type(materialValue);
  }

  public clearValue() {
    cy.get('input.value').clear();
  }

  public fillDescription(materialDescription: string) {
    cy.get('textarea.description').type(materialDescription);
  }

  public clearDescription() {
    cy.get('textarea.description').clear();
  }

  public fillCategory(materialCategory: string) {
    cy.get('input.category').type(materialCategory);
  }

  public clearCategory() {
    cy.get('input.category').clear();
  }

  public clickSaveMaterial() {
    cy.get('button.add-button').click();
  }

  public assertMaterialsCount(materialsLength: number) {
    cy.get('mat-card').should('have.length', materialsLength);
  }

  public selectTemplates() {
    cy.get('a').contains('templates').click();
    return new TemplateListPage;
  }
}

export class DeliveryTeamWorkPage {
  constructor() {}

    public clickAddStakeholder(name: string) {
      cy.wait(500);
      cy.get('mat-card.mat-elevation-z0')
      .should('contain', name)
      .contains(name).parent().parent()
      .find('button').click();
    }

    public clickDelivery() {
      cy.get('a').contains('edit').click();
      return new DeliveryFormPage;
    }
  }


export class DeliverySettingsFormPage {
  constructor() {
  }
  public pickGeneralDate(date: string) {
    cy.get('mat-datepicker-toggle button.mat-icon-button').click();
    cy.contains(date).click();
  }

  public clickCreateStep() {
    cy.get('button.create-step').click();
  }

  public fillStepName(stepName: string) {
    cy.get('input.stepName').type(stepName);
  }

  public pickStepDate(date: string) {
    cy.get('mat-form-field.stepDate button.mat-icon-button').click();
    cy.contains(date).click();
  }

  public clickSaveStep() {
    cy.get('button.add-button').click();
  }

  public clickTeamWork() {
    cy.get('a').contains('teamwork').click();
    return new DeliveryTeamWorkPage();
  }

  public clickDelivery() {
    cy.get('a').contains('edit').click();
    return new DeliveryFormPage();
  }
}

export class NewTemplatePage {
  constructor() {
    cy.contains('Save as a new template');
  }

  public openSelect() {
    cy.get('mat-select').click();
  }

  public pickOrganization(orgName: string) {
    cy.get('mat-option').contains(orgName).click();
  }

  public fillName(templateName: string) {
    cy.get('input[formcontrolname=name]').type(templateName);
  }

  public clickSave() {
    cy.get('button').contains('Save Template').click();
    return new DeliveryFormPage();
  }
}

export class DeliveryFormPage extends NavbarPage {
  constructor() {
    super();
    cy.get('.delivery-form').should('contain', 'Sign delivery');
  }

  public verifyDeletedMaterial(value: string) {
    cy.get('mat-card').contains(value).should('have.length', 0);
  }

  public verifySignatures(count: number) {
    cy.get('mat-card-footer.footerSigned').should((footers) => {
      expect(footers).to.have.length(count) });
  }

  public clickSign() {
    cy.get('[testId=modalSign]').find('button').contains('Sign').click();
    cy.wait(3000);
  }

  public fillPassword(password: string) {
    cy.get('input[type="password"]').type(password);
  }

  public clickVerifyToSign() {
    cy.get('[testId=sign]').click();
  }

  public clickAddSignature() {
    cy.get('button').contains('Add signature').click();
  }

  public clickDeleteMaterial(value: string) {
    cy.wait(1000);
    cy.get('mat-card')
    .contains(value)
    .parent().parent()
    .trigger('mouseover')
    .find('button').contains('DELETE').click({force: true});
  }

  public clickCheckBoxMaterial(name: string) {
    cy.get('mat-card')
      .contains(name)
      .parent().parent()
      .find('.mat-checkbox-inner-container')
      .click();
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
    cy.get('textarea.description').type(materialDescription);
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

  public selectHome() {
    cy.get('mat-icon[svgicon=delivery_white]').click();
    return new HomePage();
  }

  public   assertMaterialsCount(materialsLength: number) {
    cy.get('mat-card').should('have.length', materialsLength + 1);
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
    cy.wait(500);
    cy.get('span.blank').click();
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
  }

  public clickAddDelivery() {
    cy.get('button.add-delivery').click();
    return new TemplatePickerPage();
  }

  public assertDeliveryExists(orgName: string) {
    cy.get('.delivery-card').should('contain', orgName);
  }

  public clickDelivery(orgName1: string, orgName2?: string) {
    orgName2
      ? cy.get('.delivery-card').contains(orgName1 && orgName2).click()
      : cy.get('.delivery-card').contains(orgName1).click()
    return new DeliveryFormPage();
  }

  public assertDeliveryIsDeleted() {
    cy.get('.delivery-card').should('have.length', 0);
  }
}

export class AddTemplateModal {
  constructor() {
    cy.contains('Add a new template');
  }

  public fillTemplateName(name: string) {
    cy.get('[testId=templateName]').type(name);
  }

  public clickCreate() {
    cy.get('[testId=templateCreate]').click();
    return new TemplateFormPage();
  }
}

export class TemplateListPage {
  constructor() {
  }

  public selectTemplate(templateName: string) {
    cy.wait(500);
    cy.get('mat-card').contains(templateName).click();
    return new TemplateFormPage();
  }

  public assertTemplateDoesNotExists(templateName: string) {
    cy.contains(templateName).should('have.length', 0);
  }

  public clickDelete() {
    cy.get('span').contains('Delete').click({force: true});
  }

  public createTemplate() {
    cy.get('button.add-template').click();
    return new AddTemplateModal();
  }

  public assertTemplateExists(templateName: string) {
    cy.get('mat-card').contains(templateName).should('have.length', 1);
  }

  public displayTemplateMenu(templateName: string) {
    cy.wait(1000);
    cy.get('mat-card').contains(templateName).parent().parent().find('button.trigger').click({force: true});
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

export class MovieTeamWorkPage extends NavbarPage {
  constructor() {
    super();
  }
}

export class AddMovieModal {
  constructor() {}

  public fillMovieName(movieName: string) {
    cy.get('mat-dialog-container').find('input').type(movieName);
  }

  public clickCreate() {
    cy.get('mat-dialog-container').find('button.mat-primary').click();
    cy.wait(1000);
    return new MovieEditPage();
  };
}

export class MovieEditPage {
  public static FIELD_INTERNATIONAL_TITLE = 'internationalTitle'
  public static FIELD_DIRECTOR_NAME = 'directorName';
  public static FIELD_PRODUCTION_YEAR = 'productionYear';

  public static OPTION_TYPES = 'types';
  public static OPTION_GENRES = 'genres';
  public static OPTION_ORIGIN_COUNTRY = 'originCountry';
  public static OPTION_PRODUCER_COUNTRY = 'coProducerCountries';
  public static OPTION_LANGUAGES = 'languages';
  public static OPTION_STATUS = 'status';

  constructor() {
  }

  public clickHome() {
    cy.get('button[testId=home]').click({force: true});
    return new HomePage();
  }

  public clickSaveMovie() {
    cy.get('button[testId=saveMovie]').click({force: true});
  }

  public assertMovieTitleExists(movieName: string) {
    cy.get('mat-card').contains(movieName);
  }

  public assertInputAndViewValueExists(controlName: string, value: string) {
    cy.get('mat-card').contains(value);
    cy.get(`input[formControlName=${controlName}]`).should(input => {
      expect(input.val()).to.contain(value);
    })
  }

  public fillInputValue(controlName: string, value: string) {
    cy.get(`input[formControlName=${controlName}]`).type(value);
  }

  public selectOptions(controlName: string, values: string[]) {
    cy.get(`mat-select[formControlName=${controlName}]`).click();
    values.forEach(value => cy.get(`mat-option[ng-reflect-value=${value}]`).scrollIntoView().click({force: true}));
  }

  public assertOptionsExist(values: string[]) {
    values.forEach(value => {
      value = value[0].toLocaleUpperCase() + value.substring(1);
      cy.get('mat-card').contains(value);
    });
  }
}

export class HomePage extends NavbarPage {
  constructor() {
    super();
    // TODO: check if we are on a home page
  }

  public clickAddMovie(orgName: string) {
    cy.get('mat-expansion-panel').should('contain', orgName).find('button.add-movie').click();
    return new AddMovieModal();
  }

  public assertMovieNotExists(movieName: string) {
    cy.contains(movieName).should('have.length', 0);
}

  public assertOrgExists(orgName: string) {
    cy.wait(2000);
    cy.get('mat-expansion-panel').contains(orgName);
  }

  public clickCreateAnOrganization() {
    cy.get('[testId=home-empty]').find('button').click();
    return new OrganizationFormPage();
  }

  public clickOnMovie(movieName: string) {
    cy.wait(2000);
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

  public clickEdit() {
    cy.get('button').should('contain', 'Edit').contains('Edit').click();
    return new MovieEditPage();
  }

  public clickDelete() {
    cy.get('button').should('contain', 'Delete').contains('Delete').click();
    return new MovieEditPage();
  }

  public selectTemplates() {
    cy.wait(500);
    cy.get('.mat-tab-links').get('a').contains('templates').click();
    return new TemplateListPage();
  }
}

export class ViewProfilePage extends NavbarPage {
  constructor() {
    super();
    cy.get('main[testId=profileView]');
  }

  public clickEdit() {
    cy.get('main[testId=profileView]').find('button').click();
    return new EditProfilePage();
  }

  public assertEmailExists(email: string) {
    cy.get('div').contains('Email').parent().find('span').contains(email);
  }

  public assertFirstNameExists(value: string) {
    cy.get('div').contains('First Name').parent().find('span').contains(value);
  }

  public assertLastNameExists(value: string) {
    cy.get('div').contains('Last Name').parent().find('span').contains(value);
  }

  public assertBiographyExists(value: string) {
    cy.get('div').contains('Biography').parent().find('p').contains(value);
  }

  public assertIdIsAddress() {
    cy.get('label').first().contains('Id');

    cy.get('#mat-input-5', {timeout: 60000}).should(($input) => {
      expect($input.val()).to.match(/0x[a-zA-Z\d]{40}/); // ethereum address regex
    });
  }
}

export class EditProfilePage {
  constructor() {
    cy.get('[testId=profileEdit]');
  }

  public fillFirstName(value: string) {
    cy.get(`input[formControlName=first_name]`).type(value);
  }

  public fillLastName(value: string) {
    cy.get(`input[formControlName=last_name]`).type(value);
  }

  public fillBiography(value: string) {
    cy.get(`textarea[formControlName=biography]`).type(value);
    cy.wait(200);
  }

  public assertEmailExists(value: string) {
    cy.get(`input[formControlName=email]`).should(input => {
      expect(input.val()).to.contain(value);
    })
  }

  public assertFirstNameExists(value: string) {
    cy.get(`input[formControlName=first_name]`).should(input => {
      expect(input.val()).to.contain(value);
    })
  }

  public assertLastNameExists(value: string) {
    cy.get(`input[formControlName=last_name]`).should(input => {
      expect(input.val()).to.contain(value);
    })
  }

  public clickArrowBack() {
    cy.get('[testId=profileEdit]').find('button.mat-primary').contains('arrow_back').click();
    return new ViewProfilePage();
  }

  public assertBiographyExists(value: string) {
    cy.get(`textarea[formControlName=biography]`).should(input => {
      expect(input.val()).to.contain(value);
    })
  }

  public clickSave() {
    cy.get('[testId=profileEdit]').find('button.mat-primary').contains('Save').click();
  }
}

export class LandingPage {
  constructor() {
    cy.get('[testId=signup]');
    cy.get('[testId=signin]');
  }

  public fillSigninEmail(email: string) {
    cy.get('[testId=signin] input[type="email"]').type(email);
  }

  public fillSigninPassword(password: string) {
    cy.get('[testId=signin] input[type="password"]').type(password);
  }

  public login(): any {
    cy.get('[testId=signin] button').click();
    return new HomePage();
  }

  public fillSignupEmail(email: string) {
    cy.get('[testId=signup] input[type="email"]').type(email);
  }

  public fillSignupPassword(password: string) {
    cy.get('[testId=signup] input[type="password"]').eq(0).type(password);
    cy.get('[testId=signup] input[type="password"]').eq(1).type(password);
  }

  public signup(): any {
    cy.get('[testId=signup] button').click();
    return new HomePage();
  }
}
