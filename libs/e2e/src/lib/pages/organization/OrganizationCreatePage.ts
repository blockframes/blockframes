import OrganizationAppAccessPage from './OrganizationAppAccessPage';
import { Location, Organization, BankAccount } from '../../utils/type';

const PATH = '/c/organization/create';

type Entity = 'org' | 'bank';

//TODO: Move this to command interface
interface FormData {
  name: string;
  id: string;
  testId: string;
  value: string;
}

function form(entity: Entity): string {
  switch (entity) {
    case 'org':
      return 'organization-form-address';
    case 'bank':
      return '[test-id=bank-information]';
    default:
      throw Error(`Entity ${entity} not handled`);
  }
}

/**
 * This function takes fields (key: value) and calls `target.fillKey(value)`
 * @param target the page containing the methods we want to call.
 * The methods needs to begin with prefix 'fill'.
 * @param fields properties we want to use to call a method of the target
 * @param entity optional parameter to select specific forms in methods
 */
function fillAllFields(target, fields, entity?: Entity) {
  Object.entries(fields).forEach(([key, value]) => {
    const newKey = key.charAt(0).toUpperCase() + key.substring(1);
    const methodName = `fill${newKey}`;
    try {
      target[methodName](value, entity);
    } catch (e) {
      console.log(`${methodName} not found.`);
      console.log(value)
      fillAllFields(target, value, entity);
    }
  });
}

export default class OrganizationCreatePage {
  constructor() {
    cy.get('organization-create');
  }

  public assertMoveToOrgCreatePage() {
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(PATH);
    });
  }

  /** Fills every field of organization create form */
  public fillEveryFields(organization: Partial<Organization>) {
    fillAllFields(this, organization, 'org');
  }

  /** Fills every fields of address */
  public fillAddress(address: Location, entity: Entity) {
    fillAllFields(this, address, entity);
  }

  /** Fills every fields of bank information */
  public fillBankAccount(bankAccount: BankAccount) {
    fillAllFields(this, bankAccount, 'bank');
  }

  public fillName(name: string) {
    cy.get('organization-form input[test-id=name]').type(name);
  }

  public fillEmail(email: string) {
    cy.get('organization-form input[type=email]').type(email);
  }

  public fillStreet(street: string, entity: Entity) {
    cy.get(`${form(entity)} input[test-id=street]`).type(street);
  }

  public fillCity(city: string, entity: Entity) {
    cy.get(`${form(entity)} input[test-id=city]`).type(city);
  }

  public fillZipCode(zipCode: string, entity: Entity) {
    cy.get(`${form(entity)} input[test-id=zipCode]`).type(zipCode);
  }

  public fillCountry(country: string, entity: Entity) {
    cy.get(`${form(entity)} form-country input[test-id=country]`).click();
    cy.get('mat-option')
      .contains(country)
      .click();
  }

  public fillPhoneNumber(phoneNumber: string) {
    cy.get('organization-form-address input[test-id=phoneNumber]').type(phoneNumber);
  }

  public fillActivity(activity: string) {
    cy.get('organization-form mat-select[test-id=activity]').click().type(activity);
    cy.get('mat-option').contains(activity).click();
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
    cy.get('organization-create button[test-id=create]').click({ force: true });
    if (navigate) {
      return new OrganizationAppAccessPage();
    }
  }

  private handleFormInputs<E extends HTMLElement>($formEl: JQuery<E>, keyBag: string) {
    //For now do nothing..
    return true;
  }

  // TODO: Make this as a cypress command.
  // Parameters : fieldSelectors in the form
  // Value: Object data to pass in to fill the form
  // Callback : Function to handle special testId with custom form operation 
  // Logs : cy.log = fields that did not have test IDs set.
  // Debug output console.table() all the selectors and values filled.  
  public testOrgForm(org: Organization) {
    cy.log("OrganizationCreatePage: Test all form fields");
    const selector = 'organization-form form input, mat-select';
    const formData:FormData[] = [];

    cy.get(selector).each(($formEl) => {
      const keyBag = $formEl.attr('test-id');
      const formelData = {name: $formEl[0].localName, id: $formEl.attr('id'),
                   testId: $formEl.attr('test-id'), value: 'skipped'}
  
      if (keyBag === undefined) {
        formelData.testId = `undefined-[${$formEl.attr('formcontrolname') || 
                                     $formEl.attr('aria-label') || 
                                     $formEl.attr('data-placeholder')}]`;
        formelData.value = 'untouched';
        cy.log(JSON.stringify(formelData));
        formData.push(formelData);
        return;
      }
      const keyBunch = keyBag.split('-');
      //TODO: Pass this as an argument
      let vault: any = org;
      for (let i = 0 ; vault && (i < keyBunch.length); i++) {
        vault = vault[keyBunch[i]];
      }
  
      /* 
       * Perform some extra handling on the input if needed..
       * TODO: convert to callback some stuff
       */
      const needsHandling = this.handleFormInputs($formEl, keyBag);
  
      formelData.value = vault;
      if (needsHandling && (vault !== undefined)) {
        //Set the form field..
        cy.wrap($formEl).click().type(vault);
        if ($formEl.is('mat-select') || ($formEl.attr('role') === 'combobox')) {
          cy.get('mat-option')
            .contains(vault).click();
        } 
      }
      formData.push(formelData);
    })
    .last().then(() => {
      console.table(formData);
    })    
  }
}
