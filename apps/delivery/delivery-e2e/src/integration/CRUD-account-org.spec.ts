/// <reference types="cypress" />

import {
  LandingPage,
  OrganizationFormPage,
  MovieCreatePage,
  LoginPage,
  AddMovieModal,
  MovieEditPage,
  OrganizationMemberPage
} from '../support/pages';
import { createOrganization } from '../support/utils/type';
import { randomString } from '../support/utils/functions';

const USER = { email: 'test@gmx.de', password: '123123' };
const ORGANIZATION = createOrganization();
const INVITEDUSER = { email: 'hello@blockframes.com' };
const MOVIE = { name: randomString() };

beforeEach(() => {
  cy.clearCookies();
  cy.clearLocalStorage();
  cy.visit('/auth');
  cy.viewport('macbook-15');
});

describe('Test CRUD org', () => {
  it('login into an existing account, create a movie, edit an organization, add member to organization, then logout', () => {
    // Create new account
    const p1: LandingPage = new LandingPage();
    const p2: LoginPage = p1.clickCallToAction();
    p2.fillSignin(USER);
    const p3: MovieCreatePage = p2.clickSigninWithNoMovies();
    const p4: AddMovieModal = p3.clickAddMovie();
    p4.fillMovieName(MOVIE.name);
    const p5: MovieEditPage = p4.clickCreate();
    p5.openProfileMenu();
    const p6: OrganizationFormPage = p5.clickOnOrganization();
    p6.clickEditButtion();
    p6.fillAddressAndPhoneNumber(ORGANIZATION.address, ORGANIZATION.phoneNumber);
    p6.assertAddressAndPhoneNumber(ORGANIZATION.address, ORGANIZATION.phoneNumber);
    p6.clickSaveButton();
    p6.assertAddressAndPhoneNumber(ORGANIZATION.address, ORGANIZATION.phoneNumber);
    const p7: OrganizationMemberPage = p6.clickContextMenuMember();
    p7.addMemberToOrganization(INVITEDUSER.email);
    p7.sendInvitationToMember();
    // TODO(HH): assert new member in the pending member list
    const p8 = p7.clickLogout();
  });
});
