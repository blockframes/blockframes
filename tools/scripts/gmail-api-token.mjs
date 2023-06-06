import { google } from 'googleapis';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { authenticate } from '@google-cloud/local-auth';

//* Goal of this script
/*
If the email used for E2E changes, this script will retrieve the new token for Gmail-api

Steps :
1. go to https://console.cloud.google.com/apis (works best on Chrome)
2. select the project gmail-api-project
3. in the left side menu, select 'credentials'
4. download the OAuth 2.0 Client IDs as a JSON
5. rename the file credentials.json
6. move this file to this script folder
7. in a terminal in this script folder, launch : node ./tools/scripts/gmail-api-token.mjs
8. a browser window opens, sign in with blockframes.dev email and authorize everything
9. a file token.json will be created in this script folder
10. copy the values from token.json to .env
11. delete credentials.json and token.json
12. update constants file : libs\utils\src\lib\constants.ts
*/


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
