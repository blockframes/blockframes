import NavbarPage from '../NavbarPage';

export default class MemberEditablePage extends NavbarPage{
    constructor(){
        super();
        cy.get('[page-id=member-editable]', {timeout: 10000})
    }

    public addMemberToOrganization(email: string) {
        cy.get('[page-id=member-editable] input[type=email]').type(email);
    }

    public sendInvitationToMember() {
        cy.get('[page-id=member-editable] button[test-id=add]').click();
    }

    public assertInvitationPending(email: string) {
      cy.get('[test-id=member-invitation] mat-list-item', {timeout: 5000}).should((item) => expect(item).to.contain(email).length(1));
    }

    public removeInvitation(email: string) {
      cy.get('[test-id=member-invitation] mat-list-item').should((item) => expect(item).to.contain(email).length(1)).find('button').click();
    }

    public assertInvitationNotExists() {
      cy.wait(1000);
      cy.get('[test-id=member-invitation] mat-list-item').should((item) => expect(item).to.have.length(0));
    }
}
