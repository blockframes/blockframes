/// <reference types="cypress" />

import {
  WelcomeViewPage,
  OrganizationEditablePage,
  MovieCreatePage,
  LoginViewPage,
  MemberEditablePage
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
  const p1: WelcomeViewPage = new WelcomeViewPage();
  const p2: LoginViewPage = p1.clickCallToAction();
  p2.fillSignin(USER);
  p2.clickSigninWithNoMovies();
});

describe('Test CRUD org', () => {
  it('login into an existing account, edit an organization, add member to organization, remove him, then logout', () => {
    const p1 = new MovieCreatePage();
    // Edit user's organization
    p1.openProfileMenu();
    const p2: OrganizationEditablePage = p1.clickOnOrganization();
    p2.clickEditButtion();
    p2.fillAddressAndPhoneNumber(ORGANIZATION.addresses.main.street, ORGANIZATION.addresses.main.phoneNumber);
    p2.assertAddressAndPhoneNumber(ORGANIZATION.addresses.main.street, ORGANIZATION.addresses.main.phoneNumber);
    p2.clickSaveButton();
    p2.assertAddressAndPhoneNumber(ORGANIZATION.addresses.main.street, ORGANIZATION.addresses.main.phoneNumber);

    // Add a new member in user's organization and remove him
    const p3: MemberEditablePage = p2.clickContextMenuMember();
    p3.addMemberToOrganization(INVITEDUSER.email);
    p3.sendInvitationToMember();
    p3.assertInvitationPending(INVITEDUSER.email);
    p3.removeInvitation(INVITEDUSER.email);
    p3.assertInvitationNotExists();

    // Logout
    p3.clickLogout();
  });
});
