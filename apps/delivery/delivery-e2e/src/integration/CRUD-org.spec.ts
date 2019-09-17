/// <reference types="cypress" />

import {
  LandingPage,
  OrganizationFormPage,
  MovieCreatePage,
  LoginPage,
  OrganizationMemberPage
} from '../support/pages';
import { createOrganization, User } from '../support/utils/type';

const USER: Partial<User> = { email: 'cypressorg1@blockframes.com', password: 'blockframes' };
const ORGANIZATION = createOrganization();
const INVITEDUSER: Partial<User> = { email: 'cypressorg2@blockframes.com' };

beforeEach(() => {
  cy.clearCookies();
  cy.clearLocalStorage();
  cy.visit('/auth');
  cy.viewport('macbook-15');
});

describe('Test CRUD org', () => {
  it('login into an existing account, edit an organization, add member to organization, remove him, then logout', () => {
    // Signin with existing account
    const p1: LandingPage = new LandingPage();
    const p2: LoginPage = p1.clickCallToAction();
    p2.fillSignin(USER);
    const p3: MovieCreatePage = p2.clickSigninWithNoMovies();

    // Edit user's organization
    p3.openProfileMenu();
    const p4: OrganizationFormPage = p3.clickOnOrganization();
    p4.clickEditButtion();
    p4.fillAddressAndPhoneNumber(ORGANIZATION.address, ORGANIZATION.phoneNumber);
    p4.assertAddressAndPhoneNumber(ORGANIZATION.address, ORGANIZATION.phoneNumber);
    p4.clickSaveButton();
    p4.assertAddressAndPhoneNumber(ORGANIZATION.address, ORGANIZATION.phoneNumber);

    // Add a new member in user's organization and remove him
    const p5: OrganizationMemberPage = p4.clickContextMenuMember();
    p5.addMemberToOrganization(INVITEDUSER.email);
    p5.sendInvitationToMember();
    p5.assertInvitationPending(INVITEDUSER.email);
    p5.removeInvitation(INVITEDUSER.email);
    p5.assertInvitationNotExists();

    // Logout
    const p6: LoginPage = p5.clickLogout();
  });
});
