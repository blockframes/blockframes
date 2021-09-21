﻿import { acceptCookie, assertMoveTo, clickOnMenu } from '@blockframes/e2e/utils/functions';
import { SEC, serverId, testEmail } from '@blockframes/e2e/utils';
import { User, USER } from '@blockframes/e2e/fixtures/users';
import SearchPage from '../../support/pages/marketplace/SearchPage';
import ViewPage from '../../support/pages/marketplace/ViewPage';
import { titleInvest, discussionData, strEmail } from '../../fixtures/investment';
import { MessageListResult } from 'cypress-mailosaur';

const userFixture = new User();
const users  =  [ userFixture.getByUID(USER.Vincent) ];
const MOVIE_LIST_PATH = '/c/o/marketplace/title';


//! IMPORTANT for this test to run, we need to do the movie import test in catalog before.
//! Actually, we have no movie on financiers, so we need to import some to be able to work on E2E test for Financiers
describe('Invest Interest Email Test', () => {
  let test_info;

  beforeEach(() => {
    cy.viewport('ipad-2', 'landscape');
    
    //Clear all messages on server before the test
    cy.mailosaurDeleteAllMessages(serverId).then(() => {
      cy.log('Inbox empty. Ready to roll..');
    })
  });

  it('Connect to Financiers and send an invest interest email to the owners of a movie', () => {
    let discussionDataTest;
    let investor = {firstName: '', lastName: '', email: ''};
    let user = {firstName: '', lastName: '', email: ''};
    let orgName = '';
    
    cy.log("Log in Admin user Vincent");
    cy.login(users[0].email, users[0].password);
    cy.visit('/c/o/marketplace/home');
    acceptCookie();

    cy.log('Reach Financiers Marketplace');
    cy.get('financiers-marketplace h1', { timeout: 90 * SEC });

    clickOnMenu(['financiers-marketplace'], 'menu', 'title', false);
    assertMoveTo(MOVIE_LIST_PATH);

    const p3 = new SearchPage();
    cy.wait(2 * SEC);
    p3.selectMovie(titleInvest);
    const p4 = new ViewPage();
    cy.wait(2 * SEC)
    // Scroll to bottom of the page to be able to see the button opening the form
    cy.get('main').scrollTo('bottom', {ensureScrollable: false});

    p4.openDiscussionModale();

    cy.log('Check if we cannot submit Discussion Form');
    discussionDataTest = {...discussionData}; 
    delete discussionDataTest.subject;
    p4.fillDiscussionForm(discussionDataTest);
    p4.checkDiscussionForm();

    cy.log('Fill Discussion Form completely and trigger emails');
    Object.assign(discussionDataTest, discussionData);
    p4.fillDiscussionForm(discussionDataTest);
    // Object.assign(discussionDataTest, discussionData);
    // p4.fillDiscussionForm(discussionDataTest);
    p4.sendDiscussionEmail();

    // Waiting this snackbar to appear, because it appears after the emails have been sent.
    cy.get('snack-bar-container', {timeout: 60 * SEC}).should('contain', 'Your email has been sent.');
    cy.log('Email sent');
    
    cy.window().then((win) => {
      test_info = (win as any).Cypress_e2e;
    }).then(() => {
      // Check if emails are well sent.
      cy.log('Checking emails...');
      cy.mailosaurSearchMessages(serverId, {
        sentTo: testEmail
      }).then((result: MessageListResult) => {
        cy.log(`You've Got ${result.items.length} Mails! 💓`);
        const messages = result.items;
        user = test_info.user;
        investor = test_info.userSubject;
        orgName = test_info.org.denomination;
        console.log(messages);
        let idMail = '';
        messages.every(email => {
          expect(email.subject).to.contain(`is interested in ${titleInvest}`);
          //Test for a particular user and compare with email template.
          if (email.summary.includes(user.firstName)) {
            cy.log(`Checking Message: ${email.subject} ✅`);
            idMail = email.id;
            cy.log(idMail);
            return false;
          }
          return true;
        });

        //Retrieve the actual email and compare to sent one..
        if (idMail !== '') {
          cy.mailosaurGetMessageById(idMail).then((email) => {
            console.log(idMail);
            const expectedEmailSummary = strEmail(user.firstName,
              `${investor.firstName} ${investor.lastName}`, orgName, investor.email,
              titleInvest, discussionData.scope.from, discussionData.scope.to);
            const emailSent = email.text.body;
            const startIndex = emailSent.indexOf('Hi ');
            const endIndex = emailSent.indexOf('\n\nUns');
            console.log(emailSent, startIndex, endIndex);
            const regx = new RegExp(String.fromCharCode(160), "gi");
            const actualEmailSummary = emailSent.substr(startIndex, endIndex - startIndex).replace(regx, " ");
            console.log(actualEmailSummary);
            console.log(expectedEmailSummary);
            expect(actualEmailSummary).to.equal(expectedEmailSummary);
          });
        }
      });
    })
  });
});