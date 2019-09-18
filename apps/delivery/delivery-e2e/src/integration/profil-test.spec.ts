/// <reference types="cypress" />

import { User } from "../support/utils/type";
import { LandingPage, LoginPage, HomePage, ViewProfilePage, EditProfilePage } from "../support/pages";


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

describe('Test profil', () => {
  it('should login, navigate to profil, change several information', () => {
    const p1: HomePage = new HomePage();

    p1.openProfileMenu();
    const p2: ViewProfilePage = p1.clickProfile();
    const p3: EditProfilePage = p2.clickEdit();
    p3.fillName(USER.name);
    p3.fillSurname(USER.surname);
    p3.fillPhoneNumber(USER.phoneNumber);
    p3.fillPosition(USER.position);

    p2.assertDisplayNameExists(USER.name);
    p2.assertDisplaySurnameExists(USER.surname);
    p2.assertDisplayPhoneExists(USER.phoneNumber);
    p2.assertDisplayPositionExists(USER.position);

    p3.clickSave();

    p3.assertNameExists(USER.name);
    p3.assertSurnameExists(USER.surname);
    p3.assertPhoneExists(USER.phoneNumber);
    p3.assertPositionExists(USER.position);

    p2.assertDisplayNameExists(USER.name);
    p2.assertDisplaySurnameExists(USER.surname);
    p2.assertDisplayPhoneExists(USER.phoneNumber);
    p2.assertDisplayPositionExists(USER.position);

    p3.clickClose();
  });
});

describe('Test profil', () => {
  it('should login, navigate to profil, change password', () => {
    const p1: HomePage = new HomePage();

    p1.openProfileMenu();
    const p2: ViewProfilePage = p1.clickProfile();
    const p3: EditProfilePage = p2.editPassword();
    p3.currentPassword(USER.password);
    p3.newPassword(USER_UPDATED.password);
    p3.confirmPassword(USER_UPDATED.password);
    p3.clickSave();
    const p4: ViewProfilePage =  p3.clickClose();
    const p5: LoginPage = p4.clickLogout();
    p5.fillSignin(USER_UPDATED);
    const p6: HomePage = p5.clickSigninWithMovies();
  });
});
