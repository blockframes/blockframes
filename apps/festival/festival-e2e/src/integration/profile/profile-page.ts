import { clearBrowserAuth, loginWithRandomUser } from "../../support/app.po";
import USERS from 'tools/fixtures/users.json';
import { signIn } from "@blockframes/e2e/utils";

describe('Basic Landing Page, Login and Profile Page Tests', () => {

  before(() => {
    cy.visit('/')
    cy.contains('Accept cookies').click();
  })
  beforeEach(() => {
    cy.visit('/')
  })
  it('should load user and log into profile page', () => {
    loginWithRandomUser().logSubject();
    // cy.contains('Log in').click();
    // signIn(USERS.pop());
    // cy.window().should('have.property', 'LoginService');
    // cy.window().then(async (w) => {
    //   const user = USERS.pop();
    //   await w['LoginService'].signin(user.email, user.password);
    // })
    // cy.pause()
    cy.visit('c/o/account/profile/view/settings');
    cy.contains('Contact Information').should('exist');
  })
  it('should now show Accept Cookies after being accepted', () => {
    cy.contains('Accept cookies').click();
    cy.visit('/');
    cy.contains('Accept cookies').should('not.exist');
  })
  it('should show the Accept Cookies banner', () => {
    cy.contains('Accept cookies').should('exist');
  })
  afterEach(async () => {
    clearBrowserAuth()
    cy.clearCookies();
    cy.clearLocalStorage();
  })

})
