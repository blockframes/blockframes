import SendGrid from '@sendgrid/mail';
import { sendgridAPIKey } from './environments/environment';

export function sendMail(to: string, subject: string, text: string) {
  if (sendgridAPIKey === '') {
    console.warn('No sendgrid API key set, skipping');
    return;
  }
  SendGrid.setApiKey(sendgridAPIKey);
  const msg = {
    to,
    subject,
    text,
    from: 'admin@blockframes.io'
  };
  return SendGrid.send(msg);
}
