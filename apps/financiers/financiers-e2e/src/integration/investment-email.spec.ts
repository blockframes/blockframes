import { clearDataAndPrepareTest, assertMoveTo, openSidenavMenuAndNavigate } from '@blockframes/e2e/utils/functions';
import { SEC, serverId, testEmail } from '@blockframes/e2e/utils';
import { LandingPage } from '../support/pages/landing';
import { User, USER } from '@blockframes/e2e/fixtures/users';
import HomePage from '../support/pages/marketplace/HomePage';

const userFixture = new User();
const users  =  [ userFixture.getByUID(USER.Vincent) ];
const MOVIE_LIST_PATH = '/c/o/marketplace/title';

//! IMPORTANT for this test to run, we need to do the movie import test in catalog before.
//! Actually, we have no movie on financiers, so we need to import some to be able to work on E2E test for Financiers
describe('Invest Interest Email Test', () => {

  beforeEach(() => {
    cy.wait(10 * SEC);
    clearDataAndPrepareTest('');

    //Clear all messages on server before the test
    cy.mailosaurDeleteAllMessages(serverId).then(() => {
      cy.log('Inbox empty. Ready to roll..');
    })

    const p1 = new LandingPage();
    const p2 = p1.clickLogin();
    p2.fillSignin(users[0]);
    p2.clickSignIn();
  });

  it('Connect to Financiers and send an invest interest email to the owner of a movie', () => {
    const p1 = new HomePage();
    openSidenavMenuAndNavigate('library');
    assertMoveTo(MOVIE_LIST_PATH);
  })
});
