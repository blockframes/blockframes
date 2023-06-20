import { google } from 'googleapis';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { authenticate } from '@google-cloud/local-auth';

//* Goal of this script
//If the email used for E2E changes, this script will retrieve the new token for Gmail-api
//see https://www.notion.so/cascade8/Email-E2E-with-Gmail-API-d9d5d07a2a7b4ded851768655ce7c1b3

// What you can do with the api will depend on the scopes you declare below.
// see : https://developers.google.com/gmail/api/auth/scopes
const SCOPES = ['https://mail.google.com/']; // all rights
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first time.

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TOKEN_PATH = path.join(__dirname, 'token.json') || '';
const CREDENTIALS_PATH = path.join(__dirname, 'credentials.json') || '';

async function loadSavedCredentialsIfExist() {
  try {
    const content = await fs.readFile(TOKEN_PATH);
    const credentials = JSON.parse(content);
    return google.auth.fromJSON(credentials);
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

authorize();
