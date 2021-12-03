import { loginWithRandomUser } from "../../support/app.po";

describe('Profile Page', () => {

  beforeEach(() => {
    cy.visit('/')
    cy.contains('Accept cookies').click();
  })
  it('should load', () => {
    cy.visit('/')
    cy.task('getRandomUser').logSubject();
    loginWithRandomUser().logSubject();
  })

})
