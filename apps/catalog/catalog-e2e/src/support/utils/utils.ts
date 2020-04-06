import { WelcomeViewPage, LoginViewPage } from "../pages/auth";
import { HomePage } from "../pages/marketplace";
import { TitlesListPage, StartTunnelPage, TunnelMainPage } from "../pages/dashboard";
import { User } from "./type";
import { USERS } from "./users";

// Select user: david.ewing@gillespie-lawrence.fake.cascade8.com
const LOGIN_CREDENTIALS: Partial<User> = USERS[0];

export function clearDataAndPrepareTest(path: string = '/auth') {
  // Since Cypress doesn't provide method to clear indexedDB = > https://github.com/cypress-io/cypress/issues/1208
  indexedDB.deleteDatabase('firebaseLocalStorageDb');
  cy.clearCookies();
  cy.clearLocalStorage();
  cy.visit(path);
  cy.viewport('ipad-2', 'landscape');
}

export function signInAndNavigateToMain () {
  // Connexion
  const p1: WelcomeViewPage = new WelcomeViewPage();
  const p2: LoginViewPage = p1.clickCallToAction();
  p2.switchMode();
  p2.fillSignin(LOGIN_CREDENTIALS);
  const p3: HomePage = p2.clickSignIn();

  // Navigate to movie-tunnel-main
  const p4: TitlesListPage = TitlesListPage.navigateToPage();
  const p5: StartTunnelPage = p4.clickAdd();
  const p6: TunnelMainPage = p5.clickBegin();
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
