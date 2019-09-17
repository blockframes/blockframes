/// <reference types="cypress" />

import { User } from "../support/utils/type";
import { LandingPage, LoginPage, HomePage, ViewProfilePage, EditProfilePage } from "../support/pages";


const USER: Partial<User> = {
  email: 'pouetbis7@pouet.fr',
  password: 'pouetbis7',
  name: 'Clélia',
  surname: 'Mussy',
  phoneNumber: '0102030405',
  position: 'Biggest junior Web Developper'
};

const USERBIS: Partial<User> = {
  email: 'pouetbis7@pouet.fr',
  password: 'pouetpouetbis7',
  name: 'Clélia',
  surname: 'Mussy',
  phoneNumber: '0102030405',
  position: 'Biggest junior Web Developper'
};

const CURRENT_PASSWORD = "pouetbis7";
const NEW_PASSWORD = "pouetpouetbis7";

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
  it.skip('should login, navigate to profil, change password', () => {
    const p1: LandingPage = new LandingPage;
    const p2: LoginPage = p1.clickCallToAction();
    p2.fillSignin(USER);
    const p3: HomePage = p2.clickSigninWithMovies();
    p3.openProfileMenu();
    const p4: ViewProfilePage = p3.clickProfile();
    const p5: EditProfilePage = p4.editPassword();
    p5.currentPassword(CURRENT_PASSWORD);
    p5.newPassword(NEW_PASSWORD);
    p5.confirmPassword(NEW_PASSWORD);
    p5.clickSave();
    p5.clickClose();
    p4.clickLogout();
    p2.fillSignin(USERBIS);
    p2.clickSigninWithMovies();
  });
});
