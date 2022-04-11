import { Firestore } from '../types';
import { createUser } from '@blockframes/model';
import { production } from '@env';
import * as mailchimp from '@mailchimp/mailchimp_marketing';
import { getPreferenceTag, MailchimpTag } from '@blockframes/utils/mailchimp/mailchimp-model';
import { createHash } from 'crypto';

const mailchimpAPIKey = process.env.MAILCHIMP_API_KEY;
const mailchimpServer = process.env.MAILCHIMP_SERVER;
const mailchimpListId = process.env.MAILCHIMP_LIST_ID;

interface batchOperations {
  method: string,
  path: string,
  body:  string
}

export async function batchOperations(operations: batchOperations[]): Promise<void> {
  mailchimp.default.setConfig({
    apiKey: mailchimpAPIKey,
    server: mailchimpServer
  });

  return mailchimp.batches.start( {
    operations
  });
}

/**
 * Update mailchimp users list. Add non existing user, don't update existing ones.
 * @param db
 */

export async function upgrade(db: Firestore) {
  const users = await db.collection('users').get();
  let batchCalls = [];

  if (production) {
    for (let i = 0; i < users.docs.length; i++) {
      const user = createUser(users.docs[i].data());
      const isBlockframeEmail = ['dev+', 'concierge+', 'blockframes.io'].some(str => user.email.includes(str));
      if(isBlockframeEmail) continue;
      
      const method = 'POST' ;
      const subscriber_hash = createHash('md5').update(user.email).digest('hex');;
  
      const path = `lists/${mailchimpListId}/members/${subscriber_hash}/tags`;
      const tags: MailchimpTag[] = [];
  
      for (const key in user.preferences) {
        const activeTags = getPreferenceTag(key, user.preferences[key], 'active');
        tags.push(...activeTags);
      }
  
      const body = JSON.stringify({
        list_id: mailchimpListId,
        subscriber_hash,
        tags
      });
  
      batchCalls.push({
        method,
        path,
        body
      });
      
      if (i === users.docs.length) {
        await batchOperations(batchCalls);
        break;
      } else if (i % 500 === 0) {
        // max size of batch is 500
        await batchOperations(batchCalls);
        batchCalls = [];
      }
    }
  }
}