import { LandingPage } from '../../support/pages/landing';
import { acceptCookie, signIn, clickOnMenu } from '@blockframes/e2e/utils/functions';
import { SEC, User } from '@blockframes/e2e/utils';

export function signInAndNavigateToMain(user: Partial<User>, debugMovieId: string = '') {
  cy.log('Reach LandingPage and accept cookies');
  const p1 = new LandingPage();

  cy.log(`Sign-in user: ${user.email}`);
  p1.clickLogin();
  signIn(user);
  cy.get('festival-marketplace', {timeout: 60 * SEC});
  acceptCookie();

  // Navigate to movie-tunnel-main
  cy.log('Click sidemenu to reach Add New Title');
  clickOnMenu(['festival-marketplace', 'festival-dashboard'], 'menu', 'dashboard/home');
  cy.wait(1 * SEC);
  clickOnMenu(['festival-dashboard', 'festival-dashboard'], 'menu', 'title');
  cy.wait(1 * SEC);

  if (debugMovieId !== '') {
    cy.log('Check :', debugMovieId);
    const path = `http://localhost:4200/c/o/dashboard/tunnel/movie/${debugMovieId}/summary`;
    cy.visit(path);
    //window.location.href = path;
    cy.wait(3 * SEC);
    return;
  }

  cy.log('->Click: Add New Title');
  cy.get('a[mattooltip="Add Title"]', {timeout: 15 * SEC})
    .click();
  cy.wait(3 * SEC);

  cy.log('->Reach New Title Interstitial & start');
  cy.get('festival-dashboard  a:contains("Start")', { timeout: 60 * SEC })
    .click();
  cy.wait(1 * SEC);
}
