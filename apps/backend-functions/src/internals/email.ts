import SendGrid from '@sendgrid/mail';
import { sendgridAPIKey } from '../environments/environment';

export interface EmailRequest {
  to: string;
  subject: string;
  text: string;
}

/**
 * Sends a transactional email configured by the EmailRequest provided.
 *
 * Handles development mode: logs a warning when no sendgrid API key is provided.
 */
export async function sendMail({ to, subject, text }: EmailRequest): Promise<any> {
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

  console.debug("sending mail:", msg);
  return SendGrid.send(msg);
}
