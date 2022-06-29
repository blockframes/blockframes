import { EmailJSON } from '@sendgrid/helpers/classes/email-address';
import { AttachmentData } from '@sendgrid/helpers/classes/attachment';
import { sendgridEmailsFrom } from '../apps';
import { differenceInDays, differenceInHours, differenceInMinutes, format, millisecondsInHour } from 'date-fns';
import {
  Event,
  EventMeta,
  User,
  MailBucket,
  Bucket,
  createMailContract,
  MailTerm,
  staticModel,
  createMailTerm,
  App,
  AccessibilityTypes,
  Offer,
  movieCurrenciesSymbols,
  EventTypesValue,
  eventTypes,
  toLabel,
  Negotiation,
  Movie,
  Contract,
  Organization,
  MeetingEvent,
  ScreeningEvent,
  SlateEvent,
  EmailErrorCodes
} from '@blockframes/model';
import { toIcsFile } from '../agenda/utils';
import { IcsEvent } from '../agenda/agenda.interfaces';
import { getKeyIfExists } from '../helpers';

interface EmailData {
  to: string;
  subject: string;
}

export type EmailRequest = EmailData & ({ text: string } | { html: string });

export interface EmailTemplateRequest {
  to: string;
  templateId: string;
  data: {
    org?: OrgEmailData | Organization; // @TODO #7491 template d-f45a08ce5be94e368f868579fa72afa8 uses Organization but it should use OrgEmailData instead
    user?: UserEmailData;
    userSubject?: UserEmailData;
    event?: EventEmailData;
    eventUrl?: string;
    pageURL?: string;
    bucket?: MailBucket;
    baseUrl?: string;
    date?: string;
    movie?: MovieEmailData | Movie;
    offer?: OfferEmailData;
    buyer?: UserEmailData;
    contract?: Contract;
    territories?: string;
    contractId?: string;
    negotiation?: NegotiationEmailData;
    isInvitationReminder?: boolean;
  };
}


export interface EmailParameters {
  request: EmailRequest | EmailTemplateRequest;
  app?: App;
}

export interface EmailAdminParameters {
  request: EmailRequest | EmailTemplateRequest;
  from?: EmailJSON;
}

export interface EventEmailData {
  id: string;
  title: string;
  start: string;
  otherTimezones: {
    centralAmerica: string,
    easternAmerica: string,
    centralEurope: string,
    westernEurope: string,
    japan: string,
    pacific: string,
  }
  end: string;
  type: EventTypesValue;
  viewUrl: string;
  sessionUrl: string;
  accessibility: AccessibilityTypes;
  calendar: AttachmentData;
  duration: string;
}

export interface OrgEmailData {
  name: string;
  email: string;
  id: string;
  country?: string;
}

/**
 * This interface is used mainly for the users who will receive this email.
 * @dev In the backend-function/templates/mail.ts, it will refer to the `user` variable.
 * @dev An other variable `userSubject` can be used also but it will be a subject of the email
 * @example An email is sent to admins of org to let them know a new member has joined :
 * `hi user.firstName, we let you know that userSubject.firstName has joined your org today`
 */
export interface UserEmailData {
  firstName?: string;
  lastName?: string;
  email: string;
  password?: string;
  isRegistered?: boolean;
}

export interface OfferEmailData {
  id: string;
}

export interface MovieEmailData {
  id: string;
  title: {
    international: string;
  };
}

export interface NegotiationEmailData {
  price: string;
  currency: string;
  terms: MailTerm[];
}

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

interface EventEmailParameters {
  event: Event<EventMeta>;
  orgName: string;
  attachment?: boolean;
  email?: string;
  invitationId?: string;
}

export function getEventEmailData({ event, orgName, attachment = true, email, invitationId }: EventEmailParameters): EventEmailData {

  const eventStartDate = event.start;
  const eventEndDate = event.end;
  const eventUrlParams = email && invitationId ? `?email=${encodeURIComponent(email)}&i=${invitationId}` : '';

  /**
   * @dev Format from date-fns lib, here the date will be 'month/day/year, hours:min:sec am/pm GMT'
   * See the doc here : https://date-fns.org/v2.16.1/docs/format
   */

  return {
    id: event.id,
    title: event.title,
    start: format(eventStartDate, 'Pppp'),
    otherTimezones: {
      centralAmerica: toTimezone(eventStartDate, "America/Chicago"),
      easternAmerica: toTimezone(eventStartDate, "America/New_York"),
      centralEurope: toTimezone(eventStartDate, "Europe/Helsinki"),
      westernEurope: toTimezone(eventStartDate, "Europe/Paris"),
      japan: toTimezone(eventStartDate, "Asia/Tokyo"),
      pacific: toTimezone(eventStartDate, "America/Vancouver"),
    },
    end: format(eventEndDate, 'Pppp'),
    type: eventTypes[event.type],
    viewUrl: `/event/${event.id}/r/i${eventUrlParams}`,
    sessionUrl: `/event/${event.id}/r/i/session${eventUrlParams}`,
    accessibility: event.accessibility,
    calendar: attachment ? getEventEmailAttachment(event, orgName) : undefined,
    duration: getEventDuration(eventStartDate, eventEndDate)
  }
}
function toTimezone(date: Date, timeZone: string) {
  const tzDate = new Date(date.toLocaleString("en-us", { timeZone }));
  return format(tzDate, 'h:mm a');
}

function getEventDuration(start: Date, end: Date): string {
  const duration = end.getTime() - start.getTime();
  
  if (duration < millisecondsInHour) {
    return `${differenceInMinutes(end, start)} minutes`;
  } else if (duration < millisecondsInHour * 72) {
    return `${differenceInHours(end, start)} hours`;
  } else {
    return `${differenceInDays(end, start)} days`;
  }
}

function getEventEmailAttachment(event: Event<EventMeta>, orgName: string): AttachmentData {
  const icsEvent = createIcsFromEvent(event, orgName);
  return {
    filename: 'invite.ics',
    content: Buffer.from(toIcsFile([icsEvent])).toString('base64'),
    disposition: 'attachment',
    type: 'text/calendar',
  };
}

function createIcsFromEvent(e: Event<EventMeta>, orgName: string): IcsEvent {
  if (!['meeting', 'screening', 'slate'].includes(e.type)) return;
  const event = e.type == 'meeting'
    ? e as MeetingEvent
    : e.type == 'screening'
      ? e as ScreeningEvent
      : e as SlateEvent;

  return {
    id: event.id,
    title: event.title,
    start: event.start,
    end: event.end,
    description: event.meta.description,
    organizer: {
      name: orgName,
      email: sendgridEmailsFrom.festival.email
    }
  }
}

export function getOrgEmailData(org: Partial<Organization>): OrgEmailData {
  return {
    id: org.id,
    name: org.name,
    email: org.email || '',
    country: toLabel(org.addresses?.main?.country, 'territories')
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

export function getOfferEmailData(offer: Partial<Offer>): OfferEmailData {
  return {
    id: offer.id
  }
}

export function getMovieEmailData(movie: Partial<Movie>): MovieEmailData {
  return {
    id: movie.id,
    title: {
      international: movie.title.international,
    }
  }
}

export function getNegotiationEmailData(negotiation: Partial<Negotiation>): NegotiationEmailData {
  const currency = staticModel.movieCurrenciesSymbols[negotiation.currency];
  const formatter = new Intl.NumberFormat('en-US');
  const price = negotiation.price ? formatter.format(negotiation.price) : '';
  const terms = createMailTerm(negotiation.terms);

  return {
    price,
    currency,
    terms
  };
}

export function getBucketEmailData(bucket: Bucket): MailBucket {
  const currencyKey = getKeyIfExists('movieCurrencies', bucket.currency);
  const contracts = bucket.contracts.map(contract => createMailContract(contract));

  return {
    ...bucket,
    contracts,
    currency: movieCurrenciesSymbols[currencyKey]
  };
}
