import { acceptCookies, auth } from "@blockframes/testing/cypress/browser";

describe('Basic Landing Page, Login and Profile Page Tests', () => {

  beforeEach(() => {
    cy.visit('/')
    auth.clearBrowserAuth()
    cy.visit('/')
  })
  it('should load user and log into profile page', () => {
    auth.loginWithRandomUser();
    cy.visit('c/o/account/profile/view/settings');
    cy.contains('Contact Information').should('exist');
  })
  it('should now show Accept Cookies after being accepted', () => {
    acceptCookies();
    cy.visit('/');
    cy.contains('Accept Cookies').should('not.exist');
  })
  it('should show the Accept Cookies banner', () => {
    cy.contains('Accept Cookies').should('exist');
  })

})
