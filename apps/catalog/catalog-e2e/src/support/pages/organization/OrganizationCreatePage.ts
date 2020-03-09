import OrganizationAppAccessPage from "./OrganizationAppAccessPage";
import { Location, Organization, BankAccount } from "../../utils/type";

export default class OrganizationCreatePage {
  constructor() {
    cy.get('organization-create');
  }

  public assertMoveToOrgCreatePage() {
    cy.location().should((loc) => {
      expect(loc.pathname).to.eq('/c/organization/create')
    })
  }

  /**
   * Fills every field of organization create form
   * @param excludeName can be set on true to not fill the organization name
   */
  public fillEveryFields(organization: Organization, excludeName: boolean = false) {
    if (!excludeName) {
      this.fillCompanyName(organization.name);
    }
    this.fillEmailAddress(organization.email);
    this.fillAddress(organization.address, 'org');
    this.fillActivity(organization.activity);
    this.fillFiscalNumber(organization.fiscalNumber);
    this.fillBankInformation(organization.bankAccount);
  }

  /** Fills every fields of address */
  public fillAddress(address: Location, entity: 'org' | 'bank') {
    this.fillStreet(address.street, entity);
    this.fillCity(address.city, entity);
    this.fillZipCode(address.zipCode, entity);
    this.fillCountry(address.country, entity);
    if (!!address.phoneNumber) {
      this.fillPhoneNumber(address.phoneNumber);
    }
  }

  /** Fills every fields of bank information */
  public fillBankInformation(bankAccount: BankAccount) {
    this.fillIBAN(bankAccount.IBAN);
    this.fillBIC(bankAccount.BIC);
    this.fillHolderName(bankAccount.holderName);
    this.fillBankName(bankAccount.bankName);
    this.fillAddress(bankAccount.address, 'bank');
  }

  public fillCompanyName(name: string) {
    cy.get('organization-form input[test-id=name]').type(name);
  }

  public fillEmailAddress(email: string) {
    cy.get('organization-form input[type=email]').type(email);
  }

  public fillStreet(street: string, entity: 'org' | 'bank') {
    entity === 'org'
      ? cy.get('organization-form-address input[test-id=street]').type(street)
      : cy.get('organization-form input[test-id=bank-street]').type(street);
  }

  public fillCity(city: string, entity: 'org' | 'bank') {
    entity === 'org'
      ? cy.get('organization-form-address input[test-id=city]').type(city)
      : cy.get('organization-form input[test-id=bank-city]').type(city);
  }

  public fillZipCode(zipCode: string, entity: 'org' | 'bank') {
    entity === 'org'
      ? cy.get('organization-form-address input[test-id=zipCode]').type(zipCode)
      : cy.get('organization-form input[test-id=bank-zipCode]').type(zipCode);
  }

  public fillCountry(country: string, entity: 'org' | 'bank') {
    entity === 'org'
      ? cy.get('organization-form-address form-country input[test-id=country]').click()
      : cy.get('organization-form form-country[test-id=bank-form-country] input[test-id=country]').click();
    cy.get('mat-option').contains(country).click();
  }

  public fillPhoneNumber(phoneNumber: string) {
    cy.get('organization-form-address input[test-id=phoneNumber]').type(phoneNumber);
  }

  public fillActivity(activity: string) {
    cy.get('organization-form input[test-id=activity]').type(activity);
  }

  public fillFiscalNumber(fiscalNumber: string) {
    cy.get('organization-form input[test-id=fiscalNumber]').type(fiscalNumber);
  }

  public fillIBAN(iban: string) {
    cy.get('organization-form input[test-id=iban]').type(iban);
  }

  public fillBIC(bic: string) {
    cy.get('organization-form input[test-id=bic]').type(bic);
  }

  public fillHolderName(holderName: string) {
    cy.get('organization-form input[test-id=holderName]').type(holderName);
  }

  public fillBankName(bankName: string) {
    cy.get('organization-form input[test-id=bankName]').type(bankName);
  }

  /** If navigate is set to false, this doesn't return a new page. */
  public clickCreate(navigate: boolean = true) {
    cy.get('organization-create button[test-id=create]').click({force: true});
    if (navigate) {
      return new OrganizationAppAccessPage();
    }
  }
}
