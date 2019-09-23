/// <reference types="cypress" />

import {
  LoginViewPage,
  WelcomeViewPage,
  MovieListPage,
  DeliveryInformationsEditablePage,
  StarterPickerPage,
  SettingsPage,
  DeliveryEditablePage,
  MoviePickerPage,
  DeliveryListPage,
  TemplatePickerPage,
  ConfirmModal
} from '../support/pages';
import { User, DeliveryInformation } from '../support/utils/type';
import { MATERIALS } from '../support/utils/data';

//////////
// DATA //
//////////

const USER: Partial<User> = {
  email: 'cypressCRUDdelivery@blockframes.com',
  password: 'blockframes'
};

const ORGANIZATION_NAME = 'Cypress Delivery Test Organization'

const MOVIES_CYTEST = ['Starship Troopers', 'Anchorman'];

const DELIVERY_SETTINGS = ['Materials price list', 'Signature of the delivery'];
const TEMPLATE = 'Test assets'

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
}

///////////
// TESTS //
///////////

beforeEach(() => {
  cy.clearCookies();
  cy.clearLocalStorage();
  cy.visit('/auth');
  cy.viewport('ipad-2', 'landscape');
  const p1: WelcomeViewPage = new WelcomeViewPage();
  const p2: LoginViewPage = p1.clickCallToAction();
  p2.fillSignin(USER);
  p2.clickSigninWithMovies();
});

describe('User create a delivery selecting a movie', () => {
  it('should login, click on the movie card, click on create from scrash, select "Signature of the delivery", and then create a delivery', () => {
    const p1: MovieListPage = new MovieListPage();
    const p2: StarterPickerPage = p1.clickOnMovieWithNoDeliveries(MOVIES_CYTEST[0]);
    const p3: SettingsPage = p2.clickFromScratchStarter();
    p3.selectSetting(DELIVERY_SETTINGS[1]);
    const p4: DeliveryEditablePage = p3.clickContinue();
    p4.assertDeliveryMustBeSigned();
  });
});

describe('User create a delivery from context-menu item', () => {
  it('should login, click on the second movie card, click on create from template, select "Materials price list", and then create a delivery', () => {
    const p1: MovieListPage = new MovieListPage();
    const p2: MoviePickerPage = p1.selectAddDeliveryTab();
    const p3: StarterPickerPage = p2.pickMovie(MOVIES_CYTEST[1]);
    const p4: TemplatePickerPage = p3.clickTemplateStarter();
    p4.selectTemplate(TEMPLATE);
    const p5: SettingsPage = p4.clickContinue();
    p5.selectSetting(DELIVERY_SETTINGS[0]);
    const p6: DeliveryEditablePage = p5.clickContinue();
    p6.assertTableDisplayPrice();
    MATERIALS.forEach(material => p6.assertMaterialExists(material));
  });
});

describe('User create a delivery on a movie who already got deliveries', () => {
  it('should login, click on the second movie card, then click on add delivery from delivery-list, click on create from existing materials, select both options, and then create a delivery', () => {
    const p1: MovieListPage = new MovieListPage();
    const p2: DeliveryListPage = p1.clickOnMovieWithDeliveries(MOVIES_CYTEST[1]);
    const p3: StarterPickerPage = p2.clickAddDelivery();
    const p4: SettingsPage = p3.clickMaterialsStarter();
    DELIVERY_SETTINGS.forEach(setting => p4.selectSetting(setting));
    const p5: DeliveryEditablePage = p4.clickContinue();
    p5.assertDeliveryMustBeSigned();
    p5.assertTableDisplayPrice();
    MATERIALS.forEach(material => p5.assertMaterialExists(material));
  });
});

describe('User update deliveries informations', () => {
  it('should login, click on the second movie card, click on the first delivery, go to information, edit fields, save and asserts they are updated', () => {
    const p1: MovieListPage = new MovieListPage();
    const p2: DeliveryListPage = p1.clickOnMovieWithDeliveries(MOVIES_CYTEST[1]);
    const p3: DeliveryEditablePage = p2.clickFirstDelivery(ORGANIZATION_NAME);
    const p4: DeliveryInformationsEditablePage = p3.clickContextMenuInformation();
    p4.addMGAmount(DELIVERY_INFORMATION);
    p4.addDeadlines(DELIVERY_INFORMATION);
    p4.addDates(DELIVERY_INFORMATION);
    p4.addSteps(DELIVERY_INFORMATION);

    // Checks if every informations appear in the view before updating
    p4.assertAllInformationFieldsExists(DELIVERY_INFORMATION);
    p4.clickUpdateChanges();

    // Checks informations are displayed in view after updating
    p4.assertAllInformationFieldsExists(DELIVERY_INFORMATION);
  })
});

describe('User delete a delivery', () => {
  it('should login, click on the second movie card, then delete a delivery', () => {
    const p1: MovieListPage = new MovieListPage();
    const p2: DeliveryListPage = p1.clickOnMovieWithDeliveries(MOVIES_CYTEST[1]);
    const p3: DeliveryEditablePage = p2.clickFirstDelivery(ORGANIZATION_NAME);
    const p4: ConfirmModal = p3.clickDeleteDelivery();
    const p5: DeliveryListPage = p4.confirmDeleteDelivery();
    p5.assertDeliveryIsDeleted();
  });
});
