﻿import { AuthLoginPage, AuthIdentityPage } from "../pages/auth";
import { User } from "./type";
import { SEC } from './env';

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

      return cy.get(`file-uploader[test-id=${testId}] section`).trigger('drop', { dataTransfer });
    });
}

export function assertUploadStatus(content: string, testId: string) {
  return cy.get(`file-uploader[test-id=${testId}] section h3`).contains(content);
}

export const acceptCookie = () => selectAction('button[test-id="accept-cookies"]',
                                    {waitTime: 1 * SEC, message: 'Accepting all cookies'});

/**
 * selectAction : Clicks the element & waits if needed.
 * @param element : string for selecting button on the page
 * @param Option : timeouts for button, wait & logging message
 */
export function selectAction(element: string,
  Option: { waitTime?: number, timeout?: number, message?: string } =
    {waitTime : 0, timeout: 3 * SEC, message: ''}) {
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
  cy.get(`${page[0]} button[test-id="${menu}"]`, {timeout: 3 * SEC})
    .first().click();
  cy.wait(3 * SEC);
  cy.get(`aside a[routerlink*="${menu_item}"]`, {timeout: 3 * SEC})
    .click();
  cy.wait(1 * SEC);
  if (closeMenu) {
    cy.get(`${page[1]} button[test-id="${menu}"]`, {timeout: 3 * SEC})
    .first().click();
    cy.wait(1 * SEC);
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

function handleFormElement(el:any, id: string, value: string) {
  const cw = cy.wrap(el);
  let doClick = true;

  //Handle file uploads
  if (el.is('file-uploader')) {
    const uploadProps = JSON.parse(value);
    const title =  uploadProps.title || randomID();
    createFakeScript(title).then(path => {
      uploadFile(path, uploadProps.type, id);
    });
    return;
  }

  if (el.is('input') || el.is('textarea')) {
    cw.click()
      .type(value, {force: true});
    return;
  }

  if (el.is('mat-button-toggle') || el.is('mat-slide-toggle') ||
      el.is('mat-radio-button')) {
    if (value) {
      cy.get(`[test-id="${id}"]`, {timeout: 1 * SEC})
        .click();
    }
    return;
  }

  if (el.is('chips-autocomplete') || el.is('input-autocomplete')) {
    cy.get(`[test-id="${id}"] input`, {timeout: 1 * SEC})
      .type(value, {force: true});
  }

  if (el.is('static-select')) {
    cy.get(`[test-id="${id}"] .mat-form-field-outline`, {timeout: 1 * SEC})
      .first()
      .click({force: true});
      doClick = false;
  }

  if (doClick) {
    cw.click();
  }

  cy.get('mat-option', {timeout: 1 * SEC})
    .contains(value).click({force: true});
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
  const formElements = [];

  cy.get(selector).each(($formEl) => {
    const keyBag = $formEl.attr('test-id');
    const formelData = {name: $formEl[0].localName, id: $formEl.attr('id'),
                 testId: $formEl.attr('test-id'), value: 'skipped'}

    if (formElements.length) {
      const lastElement = formElements[formElements.length - 1];
      if (lastElement && lastElement.has($formEl).length) {
        cy.log(`~skipping : ${formelData.name}-id:${formelData.id}`);
        console.log(`~>skipped : ${formelData.name}-id:${formelData.id}`);
        return;
      }
    }
    formElements.push($formEl);

    if (keyBag === undefined) {
      formelData.testId = `undefined-[${$formEl.attr('formcontrolname') ||
                                   $formEl.attr('aria-label') ||
                                   $formEl.attr('data-placeholder')}]`;
      formelData.value = 'untouched';
      cy.log(JSON.stringify(formelData));
      formData.push(formelData);
      return;
    }
    const keyBunch = keyBag.split(':');
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
      handleFormElement($formEl, keyBag, vault);
    }
    formData.push(formelData);
  })
  .then(_ => console.table(formData));
}

