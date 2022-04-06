import { Firestore } from '../types';
import { createUser } from '@blockframes/model';
import { production } from '@env';
import * as mailchimp from '@mailchimp/mailchimp_marketing';

const mailchimpAPIKey = process.env.MAILCHIMP_API_KEY;
const mailchimpServer = process.env.MAILCHIMP_SERVER;
const mailchimpListId = process.env.MAILCHIMP_LIST_ID;

interface MailchimpMember {
  email: string,
  status: string
}

export async function batch(members: MailchimpMember[]): Promise<void> {
  // const mailchimp = await getMailChimp();
  mailchimp.default.setConfig({
    apiKey: mailchimpAPIKey,
    server: mailchimpServer
  });

  return mailchimp.lists.batchListMembers(mailchimpListId, {
    members,
    update_existing: false
  });
}

/**
 * Update mailchimp users list. Add non existing user, don't update existing ones.
 * @param db
 */

export async function upgrade(db: Firestore) {
  const users = await db.collection('users').get();
  let membersBatch = [];

  for (let i = 0; i < users.docs.length; i++) {
    const user = createUser(users.docs[i].data());
    
    const isBlockframeEmail = ['dev+', 'concierge+', 'blockframes.io'].some(str => user.email.includes(str));
    if(production && !isBlockframeEmail) continue;
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