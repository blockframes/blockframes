import { clearDataAndPrepareTest, assertMoveTo, openSidenavMenuAndNavigate } from '@blockframes/e2e/utils/functions';
import { SEC, serverId, testEmail } from '@blockframes/e2e/utils';
import { LandingPage } from '../support/pages/landing';
import { User, USER } from '@blockframes/e2e/fixtures/users';
import SearchPage from '../support/pages/marketplace/SearchPage';
import ViewPage from '../support/pages/marketplace/ViewPage';
import { MessageListResult } from 'cypress-mailosaur';

const userFixture = new User();
const users  =  [ userFixture.getByUID(USER.Vincent) ];
const MOVIE_LIST_PATH = '/c/o/marketplace/title';
const discussionData = {
  subject: 'Main',
  scope: {
    from: 123,
    to: 456
  },
  message: 'This is the first E2E test email on Media Financiers !'
}

//! IMPORTANT for this test to run, we need to do the movie import test in catalog before.
//! Actually, we have no movie on financiers, so we need to import some to be able to work on E2E test for Financiers
describe('Invest Interest Email Test', () => {

  beforeEach(() => {
    clearDataAndPrepareTest('/');

    //Clear all messages on server before the test
    cy.mailosaurDeleteAllMessages(serverId).then(() => {
      cy.log('Inbox empty. Ready to roll..');
    })
  })

  it('Connect to Financiers and send an invest interest email to the owners of a movie', () => {
    const p1 = new LandingPage();
    const p2 = p1.clickLogin();
    p2.fillSignin(users[0]);
    p2.clickSignIn();

    openSidenavMenuAndNavigate('library');
    assertMoveTo(MOVIE_LIST_PATH);

    const p3 = new SearchPage();
    cy.wait(2 * SEC);
    p3.selectMovie('Movie 1');
    const p4 = new ViewPage();
    cy.wait(2 * SEC)
    // Scroll to bottom of the page to be able to see the button opening the form
    cy.get('main').scrollTo('bottom', {ensureScrollable: false});
    p4.openDiscussionModale();
    p4.fillDiscussionForm(discussionData);
    p4.sendDiscussionEmail();

    // Waiting this snackbar to appear, because it appears after the emails have been sent.
    cy.get('snack-bar-container', {timeout: 30 * SEC}).should('contain', 'Your email has been sent.');
    cy.log('Email sent');

    // Check if emails are well sent.
    cy.log('Checking emails...');
    cy.mailosaurSearchMessages(serverId, {
      sentTo: testEmail
    }).then((result: MessageListResult) => {
      cy.log(`You've Got ${result.items.length} Mails! 💓`);
      const messages = result.items;
      messages.forEach(email => {
        cy.log(`Message: ${email.subject} ✅`);
      });
    });
  });
});
