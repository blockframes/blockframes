import { applicationUrl, appName } from './../apps';
import { IcsEvent } from './agenda.interfaces';

const header = `BEGIN:VCALENDAR\nVERSION:2.0\nCALSCALE:GREGORIAN\nX-WR-CALNAME:${appName.festival}`;
const footer = 'END:VCALENDAR';
const googleCalendarLink = 'https://www.google.com/calendar/event';

export function toIcsFile(events: IcsEvent[]) {

  const eventsData = events.map(event => {
    const eventData: string[] = [];
    eventData.push(`SUMMARY:${event.title}`);
    eventData.push(`DTSTART:${toIcsDate(event.start)}`);
    eventData.push(`DTEND:${toIcsDate(event.end)}`);
    eventData.push(`LOCATION: ${appName.festival}`);
    eventData.push(`DESCRIPTION: ${event.description}${event.description ? ' - ' : ''}${applicationUrl.festival}/event/${event.id}/r/i`);
    eventData.push(`ORGANIZER;CN="${event.organizer.name}":MAILTO:${event.organizer.email}`);

    return ['BEGIN:VEVENT'] // Event start tag
      .concat(eventData)
      .concat(['STATUS:CONFIRMED', 'SEQUENCE:3', 'END:VEVENT']) // Event end tags
      .join('\n');
  });

  return `${header}\n${eventsData.join('\n')}\n${footer}`;
}

export function toGoogleLink(icsEvent: IcsEvent) {

  const eventData = {
    action: 'TEMPLATE',
    text: icsEvent.title,
    dates: `${toIcsDate(icsEvent.start)}/${toIcsDate(icsEvent.end)}`,
    details: `${icsEvent.description}${icsEvent.description ? ' - ' : ''}${applicationUrl.festival}/event/${icsEvent.id}/r/i`,
    location: appName.festival,
    url: `${applicationUrl.festival}/event/${icsEvent.id}/r/i`,
    trp: 'false'
  };

  const params = Object.entries(eventData).map(pair => pair.map(encodeURIComponent).join('=')).join('&');
  return `${googleCalendarLink}?${params}`;
}

export function downloadIcs(icsEvents: IcsEvent[], filename = 'events.ics') {
  const data = toIcsFile(icsEvents);
  const element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(data));
  element.setAttribute('download', filename);
  element.setAttribute('target', '_blank');
  element.style.display = 'none';
  element.click();
}

const toIcsDate = (date: Date): string => {
  if (!date) return '';
  const y = date.getUTCFullYear();
  const m = `${date.getUTCMonth() < 9 ? '0' : ''}${date.getUTCMonth() + 1}`;
  const d = `${date.getUTCDate() < 10 ? '0' : ''}${date.getUTCDate()}`;
  const hh = `${date.getUTCHours() < 10 ? '0' : ''}${date.getUTCHours()}`;
  const mm = `${date.getUTCMinutes() < 10 ? '0' : ''}${date.getUTCMinutes()}`;
  return `${y}${m}${d}T${hh}${mm}00Z`;
}
