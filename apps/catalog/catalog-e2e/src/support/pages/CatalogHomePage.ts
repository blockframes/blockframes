export default class CatalogHomePage {
    constructor() {
        // TOOD add content-id and page-id
    }

    public clickOnHeaderButton() {
        cy.get('[test-id=header] button[mat-button]').click().contains('[test-id=search]');
    }

    public clickOnBestSellers() {
        cy.scrollTo('center');
        cy.get('[test-id=bestSeller] button[mat-button]').click();
    }
}