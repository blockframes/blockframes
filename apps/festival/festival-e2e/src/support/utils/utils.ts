import { LandingPage } from '../../support/pages/landing';
//import { TitlesListPage, StartTunnelPage, TunnelMainPage } from '../pages/dashboard';
import { User, USER } from '@blockframes/e2e/fixtures/users';
import { signIn } from '@blockframes/e2e/utils/functions';
import { TO } from '@blockframes/e2e/utils/env';

const userFixture = new User();
const users  =  [ userFixture.getByUID(USER.Jean) ];

export function signInAndNavigateToMain() {
  const p1 = new LandingPage();
  //Note: Here we click sign-up because inside signIn
  //we switchmode to Login.
  p1.clickSignup();   
  signIn(users[0]);
  //const p3 = new HomePage();
  //cy.get('catalog-home', {timeout: TO.PAGE_LOAD});
  // Navigate to movie-tunnel-main
  //const p4: TitlesListPage = TitlesListPage.navigateToPage();

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
