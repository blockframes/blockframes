import { createUser } from '@blockframes/model';
import { production } from '@env';
import * as mailchimp from '@mailchimp/mailchimp_marketing';
import { getPreferenceTag, MailchimpTag } from '@blockframes/utils/mailchimp/mailchimp-model';
import { createHash } from 'crypto';
import { delay } from '@blockframes/utils/helpers';

const batchSize = 250; // max size of batch is 500

const mailchimpAPIKey = '';
const mailchimpServer = 'us4';
const mailchimpListId = '';

export async function migration7677(db: FirebaseFirestore.Firestore) {
  if(!production) {
    console.log('script should run on production only');
    return false;
  }
  if(!mailchimpAPIKey || !mailchimpListId ) {
    console.log('missing credentials');
    return false;
  }

  console.log('starting migration 76');
  await m76(db);
  console.log('starting migration 77');
  await m77(db);
  console.log('ended !');
  return true;
}

interface batchOperations {
  method: string;
  path: string;
  body: string;
}

async function batchOperations(operations: batchOperations[]): Promise<void> {
  console.log(`processing ${operations.length} batch`);
  await delay(5000);
  mailchimp.default.setConfig({
    apiKey: mailchimpAPIKey,
    server: mailchimpServer
  });

  return mailchimp.batches.start({ operations });
}

interface MailchimpMember {
  email: string,
  status: string
}

async function batch(members: MailchimpMember[]): Promise<void> {
  console.log(`processing ${members.length} batch`);
  await delay(5000);
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

async function m76(db: FirebaseFirestore.Firestore) {
  const users = await db.collection('users').get();
  let membersBatch = [];

  for (let i = 0; i < users.docs.length; i++) {
    const user = createUser(users.docs[i].data());

    const isBlockframeEmail = ['dev+', 'concierge+', 'blockframes.io'].some(str => user.email.includes(str));
    if (isBlockframeEmail) continue;
    const member = {
      email_address: user.email,
      status: 'subscribed'
    };
    membersBatch.push(member);

    if (membersBatch.length === batchSize) {
      await batch(membersBatch);
      membersBatch = [];
    }

  }
  if(membersBatch.length) await batch(membersBatch);
}

/**
 * Update mailchimp users list, synchronizing their tags based on user preferences.
 * @param db
 */

async function m77(db: FirebaseFirestore.Firestore) {
  const users = await db.collection('users').get();
  let batchCalls = [];

  for (let i = 0; i < users.docs.length; i++) {
    const user = createUser(users.docs[i].data());
    const isBlockframeEmail = ['dev+', 'concierge+', 'blockframes.io'].some(str => user.email.includes(str));
    if (isBlockframeEmail) continue;

    const method = 'POST';
    const subscriber_hash = createHash('md5').update(user.email).digest('hex');

    const path = `lists/${mailchimpListId}/members/${subscriber_hash}/tags`;
    const tags: MailchimpTag[] = [];

    for (const key in user.preferences) {
      const activeTags = getPreferenceTag(key, user.preferences[key], 'active');
      tags.push(...activeTags);
    }

    const body = JSON.stringify({
      mailchimpListId,
      subscriber_hash,
      tags
    });

    batchCalls.push({ method, path, body });

    if (batchCalls.length === batchSize) {
      await batchOperations(batchCalls);
      batchCalls = [];
    }
  }

  if(batchCalls.length) await batchOperations(batchCalls);
}