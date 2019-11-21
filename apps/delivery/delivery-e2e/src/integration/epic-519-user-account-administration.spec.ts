/// <reference types="cypress" />
import { createUser, LoginViewPage, OrganizationHomePage, setupForMacbook, WelcomeViewPage } from '../support';

const USER = createUser();

beforeEach(() => {
  setupForMacbook();
});

describe('story #529 - account creation', () => {
  it.skip('should let me create a user account and send me to the organization creation page', () => {
    const p1: WelcomeViewPage = new WelcomeViewPage();
    const p2: LoginViewPage = p1.clickCallToAction();

    p2.switchMode();
    p2.fillSignup(USER);
    const p3: OrganizationHomePage = p2.clickSignup();
    p3.clickLogout();
  });
});
