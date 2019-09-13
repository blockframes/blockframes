/// <reference types="cypress" />

import { User } from "../support/utils/type";
import { LandingPage, LoginPage, HomePage, ViewProfilePage, EditProfilePage } from "../support/pages";


const USER: Partial<User> = {
  email: 'pouetbis7@pouet.fr',
  password: 'pouetbis7'
};

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
    p5.fillName('Mussy');
    p5.fillSurname('Clelia');
    p5.clickSave();
    p5.clickClose();
  });
});
