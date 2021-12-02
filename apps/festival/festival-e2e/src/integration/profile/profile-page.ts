
describe('Profile Page', () => {

  beforeEach(() => {
    cy.visit('/')
    cy.contains('Accept cookies').click();
  })
  it('should load', () => {
    cy.visit('/')
    cy.task('log', 'THIS IS TEST')
    cy.task('getRandomUID').logSubject();
  })

})
