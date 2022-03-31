import { Firestore } from '../types';

import { createUser } from '@blockframes/model';

// MAILCHIMP

const mailchimpAPIKey = process.env.MAILCHIMP_API_KEY;
const mailchimpServer = process.env.MAILCHIMP_SERVER;
const mailchimpListId = process.env.MAILCHIMP_LIST_ID;
let _mailchimp;

async function getMailChimp() {
  if (!_mailchimp) {
    _mailchimp = await import("@mailchimp/mailchimp_marketing").then(mailchimp => mailchimp.default);
  }
  return _mailchimp
}

export async function batch(membersArray): Promise<void> {
  const mailchimp = await getMailChimp();
  mailchimp.setConfig({
    apiKey: mailchimpAPIKey,
    server: mailchimpServer
  });

  return mailchimp.lists.batchListMembers(mailchimpListId, {
    members: membersArray,
    update_existing: false
  });
}
/**
 * Update mailchimp users list. Add non existing user, don't update existing ones.
 * @param db
 * @returns
 */


export async function upgrade(db: Firestore) {
  const users = await db.collection('users').get();
  let membersBatch = [];

  for (let i = 0; i < users.docs.length; i++) {
    const user = createUser(users.docs[i].data());

    const member = {
      email_address: user.email,
      status: 'subscribed'
    };
    membersBatch.push(member);

    if (i === users.docs.length) {
      await batch(membersBatch);
      break;
    } else if (i % 500 === 0) {
      // max size of batch is 500
      await batch(membersBatch);
      membersBatch = [];
    }
  }
}