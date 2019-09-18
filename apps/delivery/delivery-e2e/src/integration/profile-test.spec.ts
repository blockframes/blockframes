/// <reference types="cypress" />

import { User } from "../support/utils/type";
import { LandingPage, LoginPage, HomePage, EditProfilePage } from "../support/pages";


const USER: Partial<User> = {
  email: 'c8test@ctest.com',
  password: 'c8test',
  name: 'Clélia',
  surname: 'Mussy',
  phoneNumber: '0102030405',
  position: 'Biggest junior Web Developper'
};

const USER_UPDATED: Partial<User> = {
  email: 'c8test@ctest.com',
  password: 'c8testbis',
};

beforeEach(() => {
  cy.clearCookies();
  cy.clearLocalStorage();
  cy.visit('/auth');
  const p1: LandingPage = new LandingPage();
  const p2: LoginPage = p1.clickCallToAction();
  p2.fillSignin(USER);
  p2.clickSigninWithMovies();
});

describe('Test profile', () => {
  it('should login, navigate to profile, change several information', () => {
    const p1: HomePage = new HomePage();

    p1.openProfileMenu();
    const p2: EditProfilePage = p1.clickProfile();
    p2.clickEdit();
    p2.fillName(USER.name);
    p2.fillSurname(USER.surname);
    p2.fillPhoneNumber(USER.phoneNumber);
    p2.fillPosition(USER.position);

    p2.assertDisplayNameExists(USER.name);
    p2.assertDisplaySurnameExists(USER.surname);
    p2.assertDisplayPhoneExists(USER.phoneNumber);
    p2.assertDisplayPositionExists(USER.position);

    p2.clickSave();

    p2.assertNameExists(USER.name);
    p2.assertSurnameExists(USER.surname);
    p2.assertPhoneExists(USER.phoneNumber);
    p2.assertPositionExists(USER.position);

    p2.assertDisplayNameExists(USER.name);
    p2.assertDisplaySurnameExists(USER.surname);
    p2.assertDisplayPhoneExists(USER.phoneNumber);
    p2.assertDisplayPositionExists(USER.position);

    p2.clickClose();
  });
});

describe('Test change password', () => {
  it('should login, navigate to profile, change password', () => {
    const p1: HomePage = new HomePage();

    p1.openProfileMenu();
    const p2: EditProfilePage = p1.clickProfile();
    p2.editPassword();
    p2.currentPassword(USER.password);
    p2.newPassword(USER_UPDATED.password);
    p2.confirmPassword(USER_UPDATED.password);
    p2.clickSave();
    p2.clickClose();
    const p3: LoginPage = p2.clickLogout();
    p3.fillSignin(USER_UPDATED);
    p3.clickSigninWithMovies();
  });
});
