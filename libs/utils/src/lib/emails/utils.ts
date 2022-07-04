import { EmailJSON } from '@sendgrid/helpers/classes/email-address';
import { AttachmentData } from '@sendgrid/helpers/classes/attachment';
import { sendgridEmailsFrom } from '../apps';
import { differenceInDays, differenceInHours, differenceInMinutes, format, millisecondsInHour } from 'date-fns';
import {
  Event,
  EventMeta,
  MailBucket,
  App,
  AccessibilityTypes,
  EventTypesValue,
  eventTypes,
  Movie,
  Contract,
  Organization,
  MeetingEvent,
  ScreeningEvent,
  SlateEvent,
  OrgEmailData,
  UserEmailData,
  MovieEmailData,
  OfferEmailData,
  NegotiationEmailData,
  EmailRequest,
} from '@blockframes/model';
import { toIcsFile } from '../agenda/utils';
import { IcsEvent } from '../agenda/agenda.interfaces';

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


