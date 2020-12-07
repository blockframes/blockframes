import { LandingPage } from '../../support/pages/landing';
import { acceptCookie, signIn, selectAction, clickOnMenu } from '@blockframes/e2e/utils/functions';
import { TO, User } from '@blockframes/e2e/utils';

export function signInAndNavigateToMain(user: Partial<User>, debugMovieId: string = '') {
  cy.log('Reach LandingPage and accept cookies');
  const p1 = new LandingPage();
    
  //Note: Here we click sign-up because inside signIn
  //we switchmode to Login.
  cy.log(`Sign-in user: ${user.email}`);
  p1.clickSignup();   
  signIn(user);
  cy.get('festival-marketplace', {timeout: TO.PAGE_LOAD});
  acceptCookie();



  // Navigate to movie-tunnel-main
  cy.log('Click sidemenu to reach Add New Title');
  clickOnMenu(['festival-marketplace', 'festival-dashboard'], 'menu', 'dashboard/home');
  cy.wait(TO.WAIT_1SEC);
  clickOnMenu(['festival-dashboard', 'festival-dashboard'], 'menu', 'title');
  cy.wait(TO.WAIT_1SEC);

  if (debugMovieId !== '') {
    const path = '../c/o/dashboard/tunnel/movie/' + debugMovieId + 'summary';
    //cy.visit(path);
    window.location.href = path;
    cy.wait(TO.THREE_SEC);
    return;
  }

  cy.log('->Click: Add New Title');
  cy.get('a[mattooltip="Add a new title"]', {timeout: TO.FIFTEEN_SEC})
    .click();
  cy.wait(TO.THREE_SEC);

  cy.log('->Reach New Title Interstitial & start');
  cy.wait(TO.ONE_SEC);
  cy.get('festival-dashboard  a:contains("Start")', { timeout: TO.PAGE_LOAD })
    .click();
}
