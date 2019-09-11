import NavbarPage from './NavbarPage';

export default class OrganizationMemberPage extends NavbarPage{
    constructor(){
        super();
        cy.get('[page-id=organization-members]')
    }

    public addMemberToOrganization(email: string) {
        cy.get('[page-id=organization-members] input[type=email]').type(email);
    }

    public sendInvitationToMember() {
        cy.get('[page-id=organization-members] button[test-id=add]').click();
    }

    public assertInvitationPending(email: string) {
      cy.get('[test-id=invitations-pending]').get('[mat-list-item]').should(($element) => {
        expect($element).to.have.length(1)
      })
    }
}
