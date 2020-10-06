import { LandingPage } from '../../support/pages/landing';
//import { TitlesListPage, StartTunnelPage, TunnelMainPage } from '../pages/dashboard';

import { acceptCookie, signIn, selectAction, clickOnMenu } from '@blockframes/e2e/utils/functions';
import { TO, User } from '@blockframes/e2e/utils';


function confirmAction(page: string, menu: string, menu_item: string) {
  cy.get(`${page} button[test-id="${menu}"]`, {timeout: TO.PAGE_ELEMENT})
    .first().click();
  cy.wait(TO.WAIT_1SEC);
}

export function signInAndNavigateToMain(user: Partial<User>) {
  cy.log('Reach LandingPage and accept cookies');
  const p1 = new LandingPage();
  acceptCookie();
    
  //Note: Here we click sign-up because inside signIn
  //we switchmode to Login.
  cy.log(`Sign-in user: ${user.email}`);
  p1.clickSignup();   
  signIn(user);
  cy.get('festival-marketplace', {timeout: TO.PAGE_LOAD});

  // Navigate to movie-tunnel-main
  cy.log('Click sidemenu to reach Add New Title');
  clickOnMenu(['festival-marketplace', 'festival-dashboard'], 'menu', 'dashboard/home');

  clickOnMenu(['festival-dashboard', 'festival-dashboard'], 'menu', 'title');

  cy.log('->Click: Add New Title');
  cy.get('a[mattooltip="Add a new title"]', {timeout: TO.THREE_SEC})
    .click();

  cy.log('->Reach New Title Interstitial & start');
  cy.get('festival-dashboard  a:contains("Start")', { timeout: TO.PAGE_LOAD })
    .click();
  cy.wait(TO.WAIT_1SEC);


  /*
  cy.visit('c/o/dashboard/title');
  cy.wait(TO.THREE_SEC);
  //const p5: StartTunnelPage = p4.clickAdd();
  cy.get('festival-dashboard-home [mattooltip="Import a new title"]', 
          { timeout: TO.PAGE_LOAD })
    .click();  
  //const p6: TunnelMainPage = p5.clickBegin();
  */
}
