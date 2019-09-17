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

const NEW_PASSWORD = "c8testbis";

beforeEach(() => {
  cy.clearCookies();
  cy.clearLocalStorage();
  cy.visit('/auth');
});

describe('Test profil', () => {
  it('should login, navigate to profil, change several information', () => {
    const p1: LandingPage = new LandingPage;
    const p2: LoginPage = p1.clickCallToAction();
    p2.fillSignin(USER);
    const p3: HomePage = p2.clickSigninWithMovies();
    p3.openProfileMenu();
    const p4: ViewProfilePage = p3.clickProfile();
    const p5: EditProfilePage = p4.clickEdit();
    p5.fillName(USER.name);
    p5.fillSurname(USER.surname);
    p5.fillPhoneNumber(USER.phoneNumber);
    p5.fillPosition(USER.position);

    p4.assertDisplayNameExists(USER.name);
    p4.assertDisplaySurnameExists(USER.surname);
    p4.assertDisplayPhoneExists(USER.phoneNumber);
    p4.assertDisplayPositionExists(USER.position);

    p5.clickSave();

    p5.assertNameExists(USER.name);
    p5.assertSurnameExists(USER.surname);
    p5.assertPhoneExists(USER.phoneNumber);
    p5.assertPositionExists(USER.position);

    p4.assertDisplayNameExists(USER.name);
    p4.assertDisplaySurnameExists(USER.surname);
    p4.assertDisplayPhoneExists(USER.phoneNumber);
    p4.assertDisplayPositionExists(USER.position);

    p5.clickClose();
  });
});

describe('Test profil', () => {
  it('should login, navigate to profil, change password', () => {
    const p1: LandingPage = new LandingPage;
    const p2: LoginPage = p1.clickCallToAction();
    p2.fillSignin(USER);
    const p3: HomePage = p2.clickSigninWithMovies();
    p3.openProfileMenu();
    const p4: ViewProfilePage = p3.clickProfile();
    const p5: EditProfilePage = p4.editPassword();
    p5.currentPassword(USER.password);
    p5.newPassword(NEW_PASSWORD);
    p5.confirmPassword(NEW_PASSWORD);
    p5.clickSave();
    p5.clickClose();
    p4.clickLogout();
    p2.fillSignin(USER_UPDATED);
    p2.clickSigninWithMovies();
  });
});
