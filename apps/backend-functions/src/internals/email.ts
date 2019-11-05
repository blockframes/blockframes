import SendGrid from '@sendgrid/mail';
import { sendgridAPIKey } from '../environments/environment';

import { MailData } from '@sendgrid/helpers/classes/mail';

export interface EmailRequest {
  to: string;
  subject: string;
  text: string;
}

export interface EmailTemplateRequest {
  to: string;
  templateId: string;
  data: { [key: string]: any };
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

  return SendGrid.send(msg);
}

export function sendMailFromTemplate({to, templateId, data}: EmailTemplateRequest) {
  if (sendgridAPIKey === '') {
    console.warn('No sendgrid API key set, skipping');
    return;
  }
  SendGrid.setApiKey(sendgridAPIKey);

  const msg: MailData = {
    to,
    from: 'admin@blockframes.io',
    templateId,
    dynamicTemplateData: data,
  };

  return SendGrid.send(msg);
}
