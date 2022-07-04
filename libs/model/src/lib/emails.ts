import { createMailTerm, MailTerm } from './terms';
import { User } from './user';
import { Offer } from './offer';
import { Negotiation } from './negociation';
import { Movie } from './movie';
import { Organization } from './organisation';
import { toLabel } from './utils';
import { eventTypes, movieCurrenciesSymbols, staticModel } from './static/static-model';
import { Bucket, BucketEmailData } from './bucket';
import { Contract, createMailContract } from './contract';
import { AccessibilityTypes, App, EventTypesValue } from './static/types';
import { EventMeta, Event, createIcsFromEvent, toIcsFile } from './event';
import { differenceInDays, differenceInHours, differenceInMinutes, format, millisecondsInHour } from 'date-fns';

export interface OrgEmailData {
  name: string;
  email: string;
  id: string;
  country?: string;
}

export interface EmailData {
  to: string;
  subject: string;
}

export type EmailRequest = EmailData & ({ text: string } | { html: string });

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

// @see node_modules/@sendgrid/helpers/classes/attachment.d.ts
interface AttachmentData {
  content: string;
  filename: string;
  type?: string;
  disposition?: string;
  contentId?: string;
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

export interface EmailParameters {
  request: EmailRequest | EmailTemplateRequest;
  app?: App;
}

export interface EmailTemplateRequest {
  to: string;
  templateId: string;
  data: {
    org?: OrgEmailData; // @TODO #7491 template d-f45a08ce5be94e368f868579fa72afa8 uses Organization but it should use OrgEmailData instead
    user?: UserEmailData;
    userSubject?: UserEmailData;
    event?: EventEmailData;
    eventUrl?: string;
    pageUrl?: string;
    bucket?: BucketEmailData;
    baseUrl?: string;
    date?: string;
    movie?: MovieEmailData;
    offer?: OfferEmailData;
    buyer?: UserEmailData;
    contract?: Contract;
    territories?: string;
    contractId?: string;
    negotiation?: NegotiationEmailData;
    isInvitationReminder?: boolean;
  };
}

export function createEmailRequest(params: Partial<EmailRequest> = {}): EmailRequest {
  return {
    to: 'foo@bar.com',
    subject: 'Default email subject',
    text: "This is not spam, I'm just a lazy developer testing emails and forgot to change default message.",
    ...params,
  };
}

export function getUserEmailData(user: Partial<User>, password?: string): UserEmailData {
  return {
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    email: user.email || '',
    password,
    isRegistered: !!user.orgId,
  };
}

export function getOfferEmailData(offer: Partial<Offer>): OfferEmailData {
  return {
    id: offer.id,
  };
}

export function getOrgEmailData(org: Partial<Organization>): OrgEmailData {
  return {
    id: org.id,
    name: org.name,
    email: org.email || '',
    country: toLabel(org.addresses?.main?.country, 'territories')
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

export function getBucketEmailData(bucket: Bucket): BucketEmailData {
  const contracts = bucket.contracts.map(contract => createMailContract(contract));

  return {
    ...bucket,
    contracts,
    currency: movieCurrenciesSymbols[bucket.currency]
  };
}

function toTimezone(date: Date, timeZone: string) {
  const tzDate = new Date(date.toLocaleString('en-us', { timeZone }));
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

function getEventEmailAttachment(event: Event<EventMeta>, organizerEmail: string, orgName: string, applicationUrl: string): AttachmentData {
  const icsEvent = createIcsFromEvent(event, organizerEmail, orgName);
  return {
    filename: 'invite.ics',
    content: Buffer.from(toIcsFile([icsEvent], applicationUrl)).toString('base64'),
    disposition: 'attachment',
    type: 'text/calendar',
  };
}

interface EventEmailParameters {
  event: Event<EventMeta>;
  orgName?: string;
  organizerEmail?: string;
  attachment?: boolean;
  email?: string;
  invitationId?: string;
  applicationUrl?: string
}

export function getEventEmailData({ event, orgName, attachment = true, email, invitationId, organizerEmail, applicationUrl }: EventEmailParameters): EventEmailData {

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
      centralAmerica: toTimezone(eventStartDate, 'America/Chicago'),
      easternAmerica: toTimezone(eventStartDate, 'America/New_York'),
      centralEurope: toTimezone(eventStartDate, 'Europe/Helsinki'),
      westernEurope: toTimezone(eventStartDate, 'Europe/Paris'),
      japan: toTimezone(eventStartDate, 'Asia/Tokyo'),
      pacific: toTimezone(eventStartDate, 'America/Vancouver'),
    },
    end: format(eventEndDate, 'Pppp'),
    type: eventTypes[event.type],
    viewUrl: `/event/${event.id}/r/i${eventUrlParams}`,
    sessionUrl: `/event/${event.id}/r/i/session${eventUrlParams}`,
    accessibility: event.accessibility,
    calendar: attachment ? getEventEmailAttachment(event, organizerEmail, orgName, applicationUrl) : undefined,
    duration: getEventDuration(eventStartDate, eventEndDate)
  }
}