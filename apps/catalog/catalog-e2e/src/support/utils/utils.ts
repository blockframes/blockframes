import { WelcomeViewPage, LoginViewPage } from "../pages/auth";
import { HomePage } from "../pages/marketplace";
import { TitlesListPage, StartTunnelPage, TunnelMainPage } from "../pages/dashboard";
import { User } from "./type";
import { USERS } from "./users";

// Select user: cytest@blockframes.com
const LOGIN_CREDENTIALS: Partial<User> = USERS[0];

export function clearDataAndPrepareTest() {
  cy.clearCookies();
  cy.clearLocalStorage();
  cy.visit('/auth');
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
