import { loginWithRandomUser, clearBrowserAuth, loginWithUID } from "@blockframes/testing/e2e";

describe('Basic Landing Page, Login and Profile Page Tests', () => {

  before(() => {
    cy.visit('/')
  })
  beforeEach(() => {
    cy.visit('/')
    clearBrowserAuth()
    cy.visit('/')
    cy.contains('Accept cookies').click();
  })
  it('should load user and log into profile page', () => {
    // loginWithRandomUser().logSubject();
    loginWithUID('1QErdmriBqaQyobxftpWyK1ErB73').logSubject();
    cy.visit('c/o/account/profile/view/settings');
    cy.pause();
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
  })

})
