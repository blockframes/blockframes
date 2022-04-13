import { Firestore } from '../types';
import { createUser } from '@blockframes/model';
import { production } from '@env';
import * as mailchimp from '@mailchimp/mailchimp_marketing';
import { getPreferenceTag, MailchimpTag } from '@blockframes/utils/mailchimp/mailchimp-model';
import { createHash } from 'crypto';

const apiKey = process.env.MAILCHIMP_API_KEY;
const server = process.env.MAILCHIMP_SERVER;
const list_id = process.env.MAILCHIMP_LIST_ID;

interface batchOperations {
  method: string;
  path: string;
  body: string;
}

export async function batchOperations(operations: batchOperations[]): Promise<void> {
  mailchimp.default.setConfig({ apiKey, server });

  return mailchimp.batches.start({ operations });
}

/**
 * Update mailchimp users list, synchronizing their tags based on user preferences.
 * @param db
 */

export async function upgrade(db: Firestore) {
  if (!production) return;

  const users = await db.collection('users').get();
  let batchCalls = [];

  for (let i = 0; i < users.docs.length; i++) {
    const user = createUser(users.docs[i].data());
    const isBlockframeEmail = ['dev+', 'concierge+', 'blockframes.io'].some(str => user.email.includes(str));
    if (isBlockframeEmail) continue;
    
    const method = 'POST';
    const subscriber_hash = createHash('md5').update(user.email).digest('hex');

    const path = `lists/${list_id}/members/${subscriber_hash}/tags`;
    const tags: MailchimpTag[] = [];

    for (const key in user.preferences) {
      const activeTags = getPreferenceTag(key, user.preferences[key], 'active');
      tags.push(...activeTags);
    }

    const body = JSON.stringify({
      list_id,
      subscriber_hash,
      tags
    });

    batchCalls.push({ method, path, body });
    
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