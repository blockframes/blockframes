import { LandingPage } from '../../support/pages/landing';
//import { TitlesListPage, StartTunnelPage, TunnelMainPage } from '../pages/dashboard';

import { signIn, clickButton, clickOnMenu } from '@blockframes/e2e/utils/functions';
import { TO } from '@blockframes/e2e/utils/env';



export const acceptCookie = () => clickButton('button[test-id="accept-cookies"]', 
                                              {waitTime: TO.THREE_SEC});

function confirmAction(page: string, menu: string, menu_item: string) {
  cy.get(`${page} button[test-id="${menu}"]`, {timeout: TO.PAGE_ELEMENT})
    .first().click();
  cy.wait(TO.WAIT_1SEC);
}

export function signInAndNavigateToMain(user: Partial<User>) {
  // const p1 = new LandingPage();
  // cy.get('button[test-id="accept-cookies"]', {timeout: TO.THREE_SEC})
  // .click();
  // cy.wait(TO.WAIT_1SEC);
  //acceptCookie();
    
  //Note: Here we click sign-up because inside signIn
  //we switchmode to Login.
  // p1.clickSignup();   
  // signIn(users[0]);
  //const p3 = new HomePage();
  //cy.get('catalog-home', {timeout: TO.PAGE_LOAD});
  // Navigate to movie-tunnel-main
  //const p4: TitlesListPage = TitlesListPage.navigateToPage();

  clickOnMenu(['festival-marketplace', 'festival-dashboard'], 'menu', 'dashboard/home');

  clickOnMenu(['festival-dashboard', 'festival-dashboard'], 'menu', 'title');

  cy.get('a[mattooltip="Add a new title"]', {timeout: TO.THREE_SEC})
    .click();

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
