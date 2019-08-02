export default class CatalogHomePage {
    constructor() {
        cy.get('[test-id=content][page-id=catalog-homepage]')
    }

    public clickOnHeaderButton() {
        cy.get('[test-id=header] button[mat-button]').click().contains('[test-id=discover]');
    }

    public clickOnBestSellers() {
        cy.get('button[test-id=seeMore2]').click();
    }
}