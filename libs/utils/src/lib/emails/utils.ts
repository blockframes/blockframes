import { EmailJSON } from '@sendgrid/helpers/classes/email-address';
import { AttachmentData } from '@sendgrid/helpers/classes/attachment';
import { sendgridEmailsFrom } from '../apps';
import { format } from 'date-fns';
import {
  EventDocument,
  EventMeta,
  MeetingEventDocument,
  ScreeningEventDocument,
  User,
  OrganizationDocument,
  MailBucket,
  MovieDocument,
  Bucket,
  Timestamp,
  createMailContract,
  MailTerm,
  staticModel,
  NegotiationDocument,
  createMailTerm,
  App,
  AccessibilityTypes,
  ContractDocument,
  Offer,
  movieCurrenciesSymbols,
  SlateEventDocument,
  EventTypesValue,
  eventTypes,
  toLabel
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
    org?: OrgEmailData | OrganizationDocument; // @TODO #7491 template d-94a20b20085842f68fb2d64fe325638a uses OrganizationDocument but it should use OrgEmailData instead
    user?: UserEmailData;
    userSubject?: UserEmailData;
    event?: EventEmailData;
    eventUrl?: string;
    pageURL?: string;
    bucket?: MailBucket;
    baseUrl?: string;
    date?: string;
    movie?: MovieEmailData | MovieDocument;
    offer?: OfferEmailData;
    buyer?: UserEmailData;
    contract?: ContractDocument;
    territories?: string;
    contractId?: string;
    negotiation?: NegotiationEmailData;
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
  end: string;
  type: EventTypesValue;
  viewUrl: string;
  sessionUrl: string;
  accessibility: AccessibilityTypes;
  calendar: AttachmentData;
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

interface EventEmailParameters {
  event: EventDocument<EventMeta>;
  orgName: string;
  attachment?: boolean;
  email?: string;
  invitationId?: string;
}

export function getEventEmailData({ event, orgName, attachment = true, email, invitationId }: EventEmailParameters): EventEmailData {

  const eventStartDate = new Date(event.start.toDate());
  const eventEndDate = new Date(event.end.toDate());
  const eventUrlParams = email && invitationId ? `?email=${encodeURIComponent(email)}&i=${invitationId}` : '';

  /**
   * @dev Format from date-fns lib, here the date will be 'month/day/year, hours:min:sec am/pm GMT'
   * See the doc here : https://date-fns.org/v2.16.1/docs/format
   */

  return {
    id: event.id,
    title: event.title,
    start: format(eventStartDate, 'Pppp'),
    end: format(eventEndDate, 'Pppp'),
    type: eventTypes[event.type],
    viewUrl: `/event/${event.id}/r/i${eventUrlParams}`,
    sessionUrl: `/event/${event.id}/r/i/session${eventUrlParams}`,
    accessibility: event.accessibility,
    calendar: attachment ? getEventEmailAttachment(event, orgName) : undefined
  }
}

function getEventEmailAttachment(event: EventDocument<EventMeta>, orgName: string): AttachmentData {
  const icsEvent = createIcsFromEventDocument(event, orgName);
  return {
    filename: 'invite.ics',
    content: Buffer.from(toIcsFile([icsEvent])).toString('base64'),
    disposition: 'attachment',
    type: 'text/calendar',
  };
}

function createIcsFromEventDocument(e: EventDocument<EventMeta>, orgName: string): IcsEvent {
  if (!['meeting', 'screening', 'slate'].includes(e.type)) return;
  const event = e.type == 'meeting'
    ? e as MeetingEventDocument
    : e.type == 'screening'
      ? e as ScreeningEventDocument
      : e as SlateEventDocument;

  return {
    id: event.id,
    title: event.title,
    start: event.start.toDate(),
    end: event.end.toDate(),
    description: event.meta.description,
    organizer: {
      name: orgName,
      email: sendgridEmailsFrom.festival.email
    }
  }
}

export function getOrgEmailData(org: Partial<OrganizationDocument>): OrgEmailData {
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

export function getMovieEmailData(movie: Partial<MovieDocument>): MovieEmailData {
  return {
    id: movie.id,
    title: {
      international: movie.title.international,
    }
  }
}

export function getNegotiationEmailData(negotiation: Partial<NegotiationDocument>): NegotiationEmailData {
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

export function getBucketEmailData(bucket: Bucket<Timestamp>): MailBucket {
  const currencyKey = getKeyIfExists('movieCurrencies', bucket.currency);
  const contracts = bucket.contracts.map(contract => createMailContract(contract));

  return {
    ...bucket,
    contracts,
    currency: movieCurrenciesSymbols[currencyKey]
  };
}
