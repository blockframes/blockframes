import { EmailJSON } from "@sendgrid/helpers/classes/email-address";
import { App } from "../apps";
import { format } from "date-fns";
import { EventDocument, EventMeta, EventTypes } from "@blockframes/event/+state/event.firestore";
import { Organization, OrganizationDocument } from "@blockframes/organization/+state";
import { User } from "@blockframes/auth/+state";
import { AccessibilityTypes } from "../static-model";

interface EmailData {
  to: string;
  subject: string;
}

export type EmailRequest = EmailData & ({ text: string } | { html: string });

export interface EmailTemplateRequest {
  to: string;
  templateId: string;
  data: { [key: string]: unknown };
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
  sessionUrl: string,
  accessibility: AccessibilityTypes
}

export interface OrgEmailData {
  denomination: string,
  email: string,
  id: string
}

/**
 * This interface is used mainly for the users who will receive this email.
 * @dev In the backend-function/templates/mail.ts, it will refer to the `user` variable.
 * @dev An other variable `userSubject` can be used also but it will be a subject of the email
 * @example An email is sent to admins of org to let them know a new member has joined :
 * `hi user.firstName, we let you know that userSubject.firstName has joined your org today`
 */
export interface UserEmailData {
  firstName?: string,
  lastName?: string,
  email: string,
  password?: string,
  isRegistered?: boolean
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

export function getEventEmailData(event: EventDocument<EventMeta>, userEmail?: string, invitationId?: string): EventEmailData {

  const eventStartDate = new Date(event.start.toDate());
  const eventEndDate = new Date(event.end.toDate());
  const eventUrlParams = userEmail && invitationId ? `?email=${encodeURIComponent(userEmail)}&i=${invitationId}` : '';

  /**
   * @dev Format from date-fns lib, here the date will be 'month/day/year, hours:min:sec am/pm GMT'
   * See the doc here : https://date-fns.org/v2.16.1/docs/format
   */

  return {
    id: event.id,
    title: event.title,
    start: format(eventStartDate, 'Pppp'),
    end: format(eventEndDate, 'Pppp'),
    type: event.type,
    viewUrl: `/event/${event.id}/r/i${eventUrlParams}`,
    sessionUrl: `/event/${event.id}/r/i/session${eventUrlParams}`,
    accessibility: event.accessibility
  }
}

export function getOrgEmailData(org: Partial<OrganizationDocument | Organization>): OrgEmailData {
  return {
    id: org.id,
    denomination: org.denomination.full ?? org.denomination.public,
    email: org.email || ''
  }
}

export function getUserEmailData(user: Partial<User>, password?: string): UserEmailData {
  return {
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    email: user.email || '',
    password,
    isRegistered: !!user.orgId
  }
}
