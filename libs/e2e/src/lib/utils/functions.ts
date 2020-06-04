import { AuthWelcomePage, AuthLoginPage } from "../pages/auth";
import { User } from "./type";

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
export function signIn(user: Partial<User>) {
  const p1: AuthWelcomePage = new AuthWelcomePage();
  const p2: AuthLoginPage = p1.clickCallToAction();
  p2.switchMode();
  p2.fillSignin(user);
  p2.clickSignIn();
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

let currentID = 0;
export const randomID = (): string => (`${new Date().toISOString()}-${currentID++}`);
export const createFakeScript = (title: string): any => cy.task('random:pdf', title);

export function getTomorrowDay(date: Date) {
  const tomorrowDay = date.getDay() === 6 ? 0 : date.getDay() + 1;
  return tomorrowDay;
}
