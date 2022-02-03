import { loginWithRandomUser, clearBrowserAuth, loginWithUID, loginWithEmailAndPassword } from "@blockframes/testing/e2e";

describe('Basic Landing Page, Login and Profile Page Tests', () => {

  beforeEach(() => {
    cy.visit('/')
    clearBrowserAuth()
    cy.visit('/')
  })
  it('should load user and log into profile page', () => {
    // loginWithRandomUser().logSubject(); => does not work because of missing sign_in_provider in token
    // loginWithUID('1QErdmriBqaQyobxftpWyK1ErB73').logSubject(); => same
    loginWithRandomUser('emailAndPassword').logSubject(); // => do work but always fetch a blockframesAdmin user
    // loginWithEmailAndPassword('dev+scarlett-qra@blockframes.io').logSubject(); // => do work
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

})
