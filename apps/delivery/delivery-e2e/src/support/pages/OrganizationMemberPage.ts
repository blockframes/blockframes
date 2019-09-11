import NavbarPage from './NavbarPage';

export class OrganizationMemberPage extends NavbarPage{
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
}