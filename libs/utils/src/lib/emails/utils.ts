import { EmailJSON } from "@sendgrid/helpers/classes/email-address";
import { App } from "../apps";
import { format } from "date-fns";
import { EventDocument, EventMeta, EventTypes } from "@blockframes/event/+state/event.firestore";

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

export interface EventEmailData {
  id: string,
  title: string,
  start: string,
  end: string,
  type: EventTypes,
  viewUrl: string,
  sessionUrl: string
}

export type EmailErrorCodes = 'E01-unauthorized' | 'E02-general-error' | 'E03-missing-api-key' | 'E04-no-template-available';

export const emailErrorCodes = {
  unauthorized: {
    code: 'E01-unauthorized' as EmailErrorCodes,
    message: 'API key is not authorized to send mails. Please visit: https://www.notion.so/cascade8/Setup-SendGrid-c8c6011ad88447169cebe1f65044abf0'
  },
  general: {
    code: 'E02-general-error' as EmailErrorCodes,
    message: 'Unexpected error while sending email',
  },
  missingKey: {
    code: 'E03-missing-api-key' as EmailErrorCodes,
    message: 'No sendgrid API key set'
  },
  noTemplate: {
    code: 'E04-no-template-available' as EmailErrorCodes,
    message: 'There is no existing template for this email',
  }
};

export function createEmailRequest(params: Partial<EmailRequest> = {}): EmailRequest {
  return {
    to: 'foo@bar.com',
    subject: 'Default email subject',
    text: 'This is not spam, I\'m just a lazy developer testing emails and forgot to change default message.',
    ...params
  };
}

export function getEventEmailData(event?: Partial<EventDocument<EventMeta>>): EventEmailData {
  let eventStart = '';
  let eventEnd = '';
  if (!!event) {
    const eventStartDate = new Date(event.start.toDate());
    const eventEndDate = new Date(event.end.toDate());

    /**
     * @dev Format from date-fns lib, here the date will be 'month/day/year, hours:min:sec am/pm GMT'
     * See the doc here : https://date-fns.org/v2.16.1/docs/format
     */
    eventStart = format(eventStartDate, 'Pppp');
    eventEnd = format(eventEndDate, 'Pppp');
  }

  return {
    id: event?.id || '',
    title: event?.title || '',
    start: eventStart,
    end: eventEnd,
    type: event?.type,
    viewUrl: !!event?.id ? `/c/o/marketplace/event/${event.id}` : '',
    sessionUrl: !!event?.id ? `/c/o/marketplace/event/${event.id}/session` : ''
  }
}
