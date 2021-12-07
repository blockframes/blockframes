import { clearBrowserAuth, loginWithRandomUser } from "../../support/app.po";

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
  afterEach(() => {
    // clearBrowserAuth()
    // cy.clearCookies();
    // cy.clearLocalStorage();
  })

})
