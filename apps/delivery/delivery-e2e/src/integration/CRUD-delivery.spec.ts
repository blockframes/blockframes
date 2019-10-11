/// <reference types="cypress" />
import {
  ConfirmModal,
  DeliveryEditablePage,
  DeliveryInformation,
  DeliveryInformationsEditablePage,
  DeliveryListPage,
  DeliveryStakeholdersPage,
  LoginViewPage,
  MATERIALS,
  MovieListPage,
  MoviePickerPage,
  SettingsPage,
  StarterPickerPage,
  Statuses,
  TemplatePickerPage,
  UPDATED_MATERIALS,
  User,
  WelcomeViewPage
} from '../support';

//////////
// DATA //
//////////

const USER: Partial<User> = {
  email: 'cypressCRUDdelivery@blockframes.com',
  password: 'blockframes'
};

const INVITED_USER: Partial<User> = {
  email: 'cypressCRUDdelivery2@blockframes.com',
  password: 'blockframes'
};

const ORGANIZATION_NAME = 'Cypress Delivery Test';
const INVITED_ORGANIZATION_NAME = 'Cypress Invited Organization';

const MOVIES_CYTEST = ['Starship Troopers', 'Anchorman'];

const DELIVERY_SETTINGS = ['Materials price list', 'Signature of the delivery'];
const TEMPLATE = 'Test assets';

const DELIVERY_INFORMATION: DeliveryInformation = {
  minimumGuarantee: {
    amount: '90000',
    currency: 'EUR',
    deadlines: [
      {
        label: 'Initial deadline',
        percentage: '30',
        date: '03/23/2020'
      },
      {
        label: 'Last deadline',
        percentage: '70',
        date: '04/07/2020'
      }
    ]
  },
  dates: {
    dueDate: '07/20/2020',
    approvalPeriod: '30',
    reworkingPeriod: '15'
  },
  steps: [
    {
      name: 'First Step',
      date: '11/20/2019'
    },
    {
      name: 'Second Step',
      date: '12/25/2019'
    }
  ]
};

///////////
// TESTS //
///////////

// DELIVERY CRUD //

beforeEach(() => {
  cy.clearCookies();
  cy.clearLocalStorage();
  cy.visit('/auth');
  cy.viewport('ipad-2', 'landscape');
});

describe('User create a delivery selecting a movie', () => {
  it.skip('should login, click on the first movie, click on create from scrash, select "Signature of the delivery", and then create a delivery', () => {
    const p1: WelcomeViewPage = new WelcomeViewPage();
    const p2: LoginViewPage = p1.clickCallToAction();
    p2.fillSignin(USER);
    const p3: MovieListPage = p2.clickSigninWithMovies();
    const p4: StarterPickerPage = p3.clickOnMovieWithNoDeliveries(MOVIES_CYTEST[0]);
    const p5: SettingsPage = p4.clickFromScratchStarter();
    p5.selectSetting(DELIVERY_SETTINGS[1]);
    const p6: DeliveryEditablePage = p5.clickContinue();
    p6.assertDeliveryMustBeSigned();
  });
});

describe('User create a delivery from context-menu item', () => {
  it.skip('should login, click on the second movie, click on create from template, select "Materials price list", and then create a delivery', () => {
    const p1: WelcomeViewPage = new WelcomeViewPage();
    const p2: LoginViewPage = p1.clickCallToAction();
    p2.fillSignin(USER);
    const p3: MovieListPage = p2.clickSigninWithMovies();
    const p4: MoviePickerPage = p3.selectAddDeliveryTab();
    const p5: StarterPickerPage = p4.pickMovie(MOVIES_CYTEST[1]);
    const p6: TemplatePickerPage = p5.clickTemplateStarter();
    p6.selectTemplate(TEMPLATE);
    const p7: SettingsPage = p6.clickContinue();
    p7.selectSetting(DELIVERY_SETTINGS[0]);
    const p8: DeliveryEditablePage = p7.clickContinue();
    p8.assertTableDisplayPrice();
    MATERIALS.forEach(material => p8.assertMaterialExists(material));
  });
});

describe('User create a delivery on a movie who already got deliveries', () => {
  it.skip('should login, click on the second movie, then click on add delivery from delivery-list, click on create from existing materials, select both options, and then create a delivery', () => {
    const p1: WelcomeViewPage = new WelcomeViewPage();
    const p2: LoginViewPage = p1.clickCallToAction();
    p2.fillSignin(USER);
    const p3: MovieListPage = p2.clickSigninWithMovies();
    const p4: DeliveryListPage = p3.clickOnMovieWithDeliveries(MOVIES_CYTEST[1]);
    const p5: StarterPickerPage = p4.clickAddDelivery();
    const p6: SettingsPage = p5.clickMaterialsStarter();
    DELIVERY_SETTINGS.forEach(setting => p6.selectSetting(setting));
    const p7: DeliveryEditablePage = p6.clickContinue();
    p7.assertDeliveryMustBeSigned();
    p7.assertTableDisplayPrice();
    MATERIALS.forEach(material => p7.assertMaterialExists(material));
  });
});

describe('User update deliveries informations', () => {
  it.skip('should login, click on the second movie, click on the first delivery, go to information, edit fields, save and asserts they are updated', () => {
    const p1: WelcomeViewPage = new WelcomeViewPage();
    const p2: LoginViewPage = p1.clickCallToAction();
    p2.fillSignin(USER);
    const p3: MovieListPage = p2.clickSigninWithMovies();
    const p4: DeliveryListPage = p3.clickOnMovieWithDeliveries(MOVIES_CYTEST[1]);
    const p5: DeliveryEditablePage = p4.clickFirstDelivery(ORGANIZATION_NAME);
    const p6: DeliveryInformationsEditablePage = p5.clickContextMenuInformation();
    p6.addMGAmount(DELIVERY_INFORMATION);
    p6.addDeadlines(DELIVERY_INFORMATION);
    p6.addDates(DELIVERY_INFORMATION);
    p6.addSteps(DELIVERY_INFORMATION);

    // Checks if every informations appear in the view before updating
    p6.assertAllInformationFieldsExists(DELIVERY_INFORMATION);
    p6.clickUpdateChanges();

    // Checks informations are displayed in view after updating
    p6.assertAllInformationFieldsExists(DELIVERY_INFORMATION);
  });
});

describe('User delete a delivery', () => {
  it.skip('should login, click on the second movie, then delete a delivery', () => {
    const p1: WelcomeViewPage = new WelcomeViewPage();
    const p2: LoginViewPage = p1.clickCallToAction();
    p2.fillSignin(USER);
    const p3: MovieListPage = p2.clickSigninWithMovies();
    const p4: DeliveryListPage = p3.clickOnMovieWithDeliveries(MOVIES_CYTEST[1]);
    const p5: DeliveryEditablePage = p4.clickFirstDelivery(ORGANIZATION_NAME);
    const p6: ConfirmModal = p5.clickDeleteDelivery();
    const p7: DeliveryListPage = p6.confirmDeleteDelivery();
    p7.assertDeliveryIsDeleted();
  });
});

// MATERIALS CRUD //

describe('User add some materials', () => {
  it.skip('should login, click on the second movie, click on the first delivery, then create 3 materials and assert that they exist', () => {
    const p1: WelcomeViewPage = new WelcomeViewPage();
    const p2: LoginViewPage = p1.clickCallToAction();
    p2.fillSignin(USER);
    const p3: MovieListPage = p2.clickSigninWithMovies();
    const p4: DeliveryListPage = p3.clickOnMovieWithDeliveries(MOVIES_CYTEST[1]);
    const p5: DeliveryEditablePage = p4.clickFirstDelivery(ORGANIZATION_NAME);
    MATERIALS.forEach(material => {
      p5.addMaterial();
      p5.fillMaterial(material);

      // Check if material display works
      p5.assertMaterialExists(material);
    });
    p5.saveMaterial();

    // Check if materials are saved
    MATERIALS.forEach(material => p5.assertMaterialExists(material));
  });
});

describe('User update some materials fields', () => {
  it.skip('should login, click on the second movie, click on the first delivery, then update 3 materials fields and assert that they exist', () => {
    const p1: WelcomeViewPage = new WelcomeViewPage();
    const p2: LoginViewPage = p1.clickCallToAction();
    p2.fillSignin(USER);
    const p3: MovieListPage = p2.clickSigninWithMovies();
    const p4: DeliveryListPage = p3.clickOnMovieWithDeliveries(MOVIES_CYTEST[1]);
    const p5: DeliveryEditablePage = p4.clickFirstDelivery(ORGANIZATION_NAME);
    MATERIALS.forEach((material, index) => {
      p5.editMaterial(material);
      p5.clearMaterial();
      p5.fillMaterial(UPDATED_MATERIALS[index]);

      // Check if material display works
      p5.assertMaterialExists(UPDATED_MATERIALS[index]);
    });
    p5.saveMaterial();

    // Check if materials are updated
    UPDATED_MATERIALS.forEach(material => p5.assertMaterialExists(material));
  });
});

describe('User update some materials status', () => {
  it.skip('should login, click on the second movie, click on the first delivery, then update 3 materials status and assert that they exist', () => {
    const p1: WelcomeViewPage = new WelcomeViewPage();
    const p2: LoginViewPage = p1.clickCallToAction();
    p2.fillSignin(USER);
    const p3: MovieListPage = p2.clickSigninWithMovies();
    const p4: DeliveryListPage = p3.clickOnMovieWithDeliveries(MOVIES_CYTEST[1]);
    const p5: DeliveryEditablePage = p4.clickFirstDelivery(ORGANIZATION_NAME);
    p5.selectAllMaterials();
    p5.updateStatus(Statuses.AVAILABLE);
    p5.assertMaterialStatusChanged(UPDATED_MATERIALS, Statuses.AVAILABLE);
    p5.selectMaterial(UPDATED_MATERIALS[0]);
    p5.updateStatus(Statuses.PAID);
    p5.assertMaterialsArePaid([UPDATED_MATERIALS[0]]);
    p5.selectMaterial(UPDATED_MATERIALS[1]);
    p5.selectMaterial(UPDATED_MATERIALS[2]);
    p5.updateStatus(Statuses.ORDERED);
    p5.assertMaterialsAreOrdered([UPDATED_MATERIALS[1], UPDATED_MATERIALS[2]]);
  });
});

describe('User delete some materials', () => {
  it.skip("should login, click on the second movie, click on the first delivery, then delete 3 materials and assert that they don't exists", () => {
    const p1: WelcomeViewPage = new WelcomeViewPage();
    const p2: LoginViewPage = p1.clickCallToAction();
    p2.fillSignin(USER);
    const p3: MovieListPage = p2.clickSigninWithMovies();
    const p4: DeliveryListPage = p3.clickOnMovieWithDeliveries(MOVIES_CYTEST[1]);
    const p5: DeliveryEditablePage = p4.clickFirstDelivery(ORGANIZATION_NAME);
    UPDATED_MATERIALS.forEach(material => {
      p5.editMaterial(material);
      const p6: ConfirmModal = p5.deleteMaterial();
      p6.confirmDeleteMaterial();
    });
    const p7: DeliveryEditablePage = new DeliveryEditablePage();
    p7.assertNoMaterialsExists();
  });
});

// DELIVERY TEAMWORK //

describe('User invite an organization', () => {
  it.skip('should login, click on the second movie, click on the first delivery, then invite an organization and assert that stakeholder exists', () => {
    const p1: WelcomeViewPage = new WelcomeViewPage();
    const p2: LoginViewPage = p1.clickCallToAction();
    p2.fillSignin(USER);
    const p3: MovieListPage = p2.clickSigninWithMovies();
    const p4: DeliveryListPage = p3.clickOnMovieWithDeliveries(MOVIES_CYTEST[1]);
    const p5: DeliveryEditablePage = p4.clickFirstDelivery(ORGANIZATION_NAME);
    const p6: DeliveryStakeholdersPage = p5.clickContextMenuStakeholders();
    p6.inviteOrganization(INVITED_ORGANIZATION_NAME);
    p6.assertOrganizationIsInvited(INVITED_ORGANIZATION_NAME);
  });
});

describe('User accept an invitation', () => {
  it.skip('should login, click on the invitation, accept it, then sign the delivery', () => {
    const p1: WelcomeViewPage = new WelcomeViewPage();
    const p2: LoginViewPage = p1.clickCallToAction();
    p2.fillSignin(INVITED_USER);
    const p3: MovieListPage = p2.clickSigninWithMovies();
    p3.acceptInvitation();
    p3.assertMovieExists(MOVIES_CYTEST[1]);
    p3.navigateToDelivery();
  });
});
