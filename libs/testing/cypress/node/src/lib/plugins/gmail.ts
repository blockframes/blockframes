import { JWT, UserRefreshClient } from 'google-auth-library';
import { google, gmail_v1 } from 'googleapis';

//* AUTH FUNCTIONS

type Client = UserRefreshClient | JWT;

let client: Client;

function authorize() {
  if (client) return client;
  client = google.auth.fromJSON({
    type: 'authorized_user',
    client_id: process.env.CYPRESS_GMAIL_CLIENT_ID,
    client_secret: process.env.CYPRESS_GMAIL_CLIENT_SECRET,
    refresh_token: process.env.CYPRESS_GMAIL_REFRESH_TOKEN,
  });
  return client;
}

//* CYPRESS ORIENTED FUNCTIONS

export async function queryEmails(query: string): Promise<gmail_v1.Schema$Message[]> {
  // see possibles queries at https://support.google.com/mail/answer/7190?hl=fr
  const gmail = getGmail();
  const res = await gmail.users.messages.list({ userId: 'me', q: query });
  const messages = res.data.messages;
  if (messages) return messages;
  console.log(`No message found for the query : ${query}`);
  return [];
}

export async function getEmail(emailId: string): Promise<gmail_v1.Schema$Message> {
  const gmail = getGmail();
  const res = await gmail.users.messages.get({ userId: 'me', id: emailId });
  return res.data;
}

export async function deleteEmail(emailId: string): Promise<string> {
  const gmail = getGmail();
  await gmail.users.messages.delete({ userId: 'me', id: emailId });
  return `email ${emailId} deleted`;
}

//* MISCELLANEOUS

function getGmail() {
  const auth = authorize();
  const gmail = google.gmail({ version: 'v1', auth });
  return gmail;
}
