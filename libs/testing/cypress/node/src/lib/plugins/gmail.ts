import { JWT, UserRefreshClient } from 'google-auth-library';
import { google, gmail_v1 } from 'googleapis';

//* AUTH FUNCTIONS

type Client = UserRefreshClient | JWT

let client: Client;

function authorize() {
  if (client) return client;
  client = google.auth.fromJSON({
    type: 'authorized_user',
    client_id: process.env.GMAIL_CLIENT_ID,
    client_secret: process.env.GMAIL_CLIENT_SECRET,
    refresh_token: process.env.GMAIL_REFRESH_TOKEN,
  });
  return client;
}

//* CYPRESS ORIENTED FUNCTIONS

export async function queryEmails(query: string): Promise<gmail_v1.Schema$Message[]> {
  // see possibles queries at https://support.google.com/mail/answer/7190?hl=fr
  const auth = authorize();
  const gmail = google.gmail({ version: 'v1', auth });
  const res = await gmail.users.messages.list({ userId: 'me', q: query });
  const messages = res.data.messages;
  if(messages) return messages
  console.log(`No message found for the query : ${query}`)
  return [];
}

export async function getEmail(emailId: string): Promise<gmail_v1.Schema$Message> {
  const auth = authorize();
  const gmail = google.gmail({ version: 'v1', auth });
  const res = await gmail.users.messages.get({ userId: 'me', id: emailId });
  return res.data;
}

export async function deleteEmail(emailId: string): Promise<string> {
  const auth = authorize();
  const gmail = google.gmail({ version: 'v1', auth });
  await gmail.users.messages.delete({ userId: 'me', id: emailId });
  return `email ${emailId} deleted`;
}

//* OBSOLETE CODE
// as we already have the token data, we should not need to create it again from the credentials.json
// if needed, these credentials can be downloaded at https://console.cloud.google.com/apis and renamed credentials.json

//Uncomment below code if a new token is needed

/*

import { promises as fs } from 'fs';
import path from 'path';
import { authenticate } from '@google-cloud/local-auth';

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/gmail.modify'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first time.
// Note Cascade8 : copy the data from token.json in your .env and delete token.json

const TOKEN_PATH = path.join(__dirname, 'token.json') || '';
const CREDENTIALS_PATH = path.join(__dirname, 'credentials.json') || '';

async function loadSavedCredentialsIfExist() {
  console.log('***env', process.env);
  try {
    const content = await fs.readFile(TOKEN_PATH);
    const credentials = JSON.parse(content);
    return google.auth.fromJSON({
      type: 'authorized_user',
      client_id: process.env.GMAIL_CLIENT_ID,
      client_secret: process.env.GMAIL_CLIENT_SECRET,
      refresh_token: process.env.GMAIL_REFRESH_TOKEN,
    });
  } catch (err) {
    return null;
  }
}

async function saveCredentials(client) {
  const content = await fs.readFile(CREDENTIALS_PATH);
  const keys = JSON.parse(content);
  const key = keys.installed || keys.web;
  const payload = JSON.stringify({
    type: 'authorized_user',
    client_id: key.client_id,
    client_secret: key.client_secret,
    refresh_token: client.credentials.refresh_token,
  });
  await fs.writeFile(TOKEN_PATH, payload);
}

async function authorize() {
  let client = await loadSavedCredentialsIfExist();
  if (client) {
    return client;
  }
  // below code is only done once to save the token if it does not exist
  client = await authenticate({
    scopes: SCOPES,
    keyfilePath: CREDENTIALS_PATH,
  });
  if (client.credentials) {
    await saveCredentials(client);
  }
  return client;
}

*/
