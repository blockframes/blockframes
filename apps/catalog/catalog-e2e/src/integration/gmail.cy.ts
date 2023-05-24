import { gmail } from '@blockframes/testing/cypress/browser';

type MessageList = { id: string; threadId: string }[];

describe('Gmail test', () => {
  it('Get total messages', () => {
    gmail.getTotalMessages().then(total => cy.log('Total messages : ', total));
  });

  it('Get unread messages', () => {
    gmail.queryEmails('subject:"Gmail API"').then((messageList: MessageList) => {
      expect(messageList).to.have.lengthOf(1);
      const { id: mailId } = messageList[0];
      gmail.getEmail(mailId).then(email => expect(email.snippet).to.eq('Mail test'));
    });
  });
});
