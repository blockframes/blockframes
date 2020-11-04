import { EmailJSON } from "@sendgrid/helpers/classes/email-address";
import { App } from "../apps";

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

export interface EmailParameters {
  request: EmailRequest | EmailTemplateRequest,
  app?: App,
}

export interface EmailAdminParameters {
  request: EmailRequest | EmailTemplateRequest,
  from?: EmailJSON,
}

export interface EmailRecipient {
  email: string;
  name?: string;
}

export function createEmailRequest(params: Partial<EmailRequest> = {}): EmailRequest {
  return {
    to: 'foo@bar.com',
    subject: 'Default email subject',
    text: 'This is not spam, I\'m just a lazy developer testing emails and forgot to change default message.',
    ...params
  };
}