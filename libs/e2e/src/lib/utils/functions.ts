import { AuthLoginPage, AuthIdentityPage } from "../pages/auth";
import { User } from "./type";
import { TO } from './env';

/** Clear cookies, local storage, indexedDB and navigate to the path (/auth by default). */
export function clearDataAndPrepareTest(path: string = '/auth') {
  // Since Cypress doesn't provide method to clear indexedDB = > https://github.com/cypress-io/cypress/issues/1208
  cy.clearCookies();
  cy.clearLocalStorage();
  indexedDB.deleteDatabase('firebaseLocalStorageDb');
  cy.visit(path);
  cy.viewport('ipad-2', 'landscape');
}

/** Start on AuthWelcomePage, on AuthLoginPage and signin. You have to create a new page depending of the app. */
export function signIn(user: Partial<User>, fillIdentity: boolean = false) {
  const p1: AuthLoginPage = new AuthLoginPage();
  p1.switchMode();
  p1.fillSignin(user);
  p1.clickSignIn();
  cy.wait(10000);
  //Submit Identity on demand
  if (fillIdentity) {
    // cy.url().then(afterLoginURL => {
    //   if (afterLoginURL.includes('auth/identity')) {
    //     const pIdentity = new AuthIdentityPage();
    //     pIdentity.confirm(user);
    //   }
    // });
    //return cy.url();
  }

  //return "";
}

export function uploadFile(p: string, type: string, testId: string): any {
  return cy.readFile(p, 'base64')
    .then((x) => Cypress.Blob.base64StringToBlob(x, type))
    .then((content) => {
      const testfile = new File([content], 'my-script.pdf', { type });
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(testfile);

      return cy.get(`file-upload[test-id=${testId}] section`).trigger('drop', { dataTransfer });
    });
}

export function assertUploadStatus(content: string, testId: string) {
  return cy.get(`file-upload[test-id=${testId}] section h3`).contains(content);
}

export const acceptCookie = () => selectAction('button[test-id="accept-cookies"]', 
                                    {waitTime: TO.ONE_SEC, message: 'Accepting all cookies'});

/**
 * selectAction : Clicks the element & waits if needed.
 * @param element : string for selecting button on the page
 * @param Option : timeouts for button, wait & logging message
 */
export function selectAction(element: string, 
  Option: { waitTime?: number, timeout?: number, message?: string } = 
    {waitTime : 0, timeout: TO.PAGE_ELEMENT, message: ''}) {
  if (Option.message !== '') {
    cy.log(Option.message);
  }
  cy.get(element, {timeout: Option.timeout})
    .click();
  if (Option.waitTime !== 0) {
    cy.wait(Option.waitTime);
  }
}

/**
 * clickOnMenu : Clicks the sidemenu
 * @param page : array of page strings
 * @param menu : string representing drawer button
 * @param menu_item : side menu item to click
 * @param closeMenu : boolean, false to leave side menu opened
 */
export function clickOnMenu(page: string[], menu: string, menu_item: string,
  closeMenu: boolean = true) {
  cy.get(`${page[0]} button[test-id="${menu}"]`, {timeout: TO.PAGE_ELEMENT})
    .first().click();
  cy.wait(TO.THREE_SEC);
  cy.get(`aside a[routerlink*="${menu_item}"]`, {timeout: TO.PAGE_ELEMENT})
    .click();
  cy.wait(TO.WAIT_1SEC);
  if (closeMenu) {
    cy.get(`${page[1]} button[test-id="${menu}"]`, {timeout: TO.PAGE_ELEMENT})
    .first().click();
    cy.wait(TO.WAIT_1SEC);
  }
}

let currentID = 0;
export const randomID = (): string => (`${new Date().getTime()}-${currentID++}`);
export const createFakeScript = (title: string): any => cy.task('random:pdf', title);

export function getTomorrowDay(date: Date) {
  const tomorrowDay = date.getDay() === 6 ? 0 : date.getDay() + 1;
  return tomorrowDay;
}

export interface FormOptions {
  inputValue: any;
  specialIds?: string[];
  fieldHandler? <E extends HTMLElement>($formEl: JQuery<E>, key: string): [boolean, string] 
}

interface FormData {
  name: string;
  id: string;
  testId: string;
  value: string;
}

/**
 * setForm : helper function to set the form with given values
 * @param selector : string to identify the form set
 * @param formOpt : object having input values, callback for spl ids.
 * @example
 *   //set org details in org form
 *   const formOpt: FormOptions = {
 *     inputValue: organizationDetails
 *   }
 *   setForm('organization-form form input', formOpt);
 */
export function setForm(selector: string, formOpt: FormOptions) {
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
    let vault: any = formOpt.inputValue;
    for (let i = 0 ; vault && (i < keyBunch.length); i++) {
      vault = vault[keyBunch[i]];
    }

    /* 
     * Perform some extra handling on the input if needed..
     */
    let needsHandling = true, setValue;
    if (formOpt.specialIds?.includes(keyBag) && formOpt.fieldHandler) {
      [needsHandling, setValue] = formOpt.fieldHandler($formEl, keyBag);
    }
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
  });
}

