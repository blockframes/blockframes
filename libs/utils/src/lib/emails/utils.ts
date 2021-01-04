import { EmailJSON } from "@sendgrid/helpers/classes/email-address";
import { App } from "../apps";
import { format } from "date-fns";
import { EventDocument, EventMeta } from "@blockframes/event/+state/event.firestore";

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

export interface EventEmailData {
  id: string,
  title: string,
  start: string,
  end: string
}

export function createEmailRequest(params: Partial<EmailRequest> = {}): EmailRequest {
  return {
    to: 'foo@bar.com',
    subject: 'Default email subject',
    text: 'This is not spam, I\'m just a lazy developer testing emails and forgot to change default message.',
    ...params
  };
}

export function getEventEmailData(event: Partial<EventDocument<EventMeta>> = {}): EventEmailData {
  const eventStartDate = event.start.toDate();
  const eventEndDate = event.end.toDate();
  /**
   * @dev Format from date-fns lib, here the date will be 'month/day/year, hours:min:sec am/pm GMT'
   * See the doc here : https://date-fns.org/v2.16.1/docs/format
   */
  const eventStart = format(eventStartDate, 'Pppp');
  const eventEnd = format(eventEndDate, 'Pppp');

  return {
    id: event.id,
    title: event.title,
    start: eventStart,
    end: eventEnd
  }
}
