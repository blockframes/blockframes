import { applicationUrl, appName } from './../apps';
import { IcsEvent } from './ics.interfaces';

const header = `BEGIN:VCALENDAR\nVERSION:2.0\nCALSCALE:GREGORIAN`;
const footer = 'END:VCALENDAR';

export function toIcsFile(events: IcsEvent[]) {

  const eventsData = events.map(event => {
    const eventData: string[] = [];
    eventData.push(`SUMMARY:${event.title}`);
    eventData.push(`DTSTART;TZID=Europe/Paris:${toIcsDate(event.start)}`);
    eventData.push(`DTEND;TZID=Europe/Paris:${toIcsDate(event.end)}`);
    eventData.push(`LOCATION: ${appName.festival}`);
    eventData.push(`DESCRIPTION: ${event.description}${event.description ? ' - ' : ''}${applicationUrl.festival}/event/${event.id}/r/i`);
    eventData.push(`ORGANIZER;CN=${event.organizer.name}:MAILTO:${event.organizer.email}`);

    return ['BEGIN:VEVENT'] // Event start tag
      .concat(eventData)
      .concat(['STATUS:CONFIRMED', 'SEQUENCE:3', 'END:VEVENT']) // Event end tags
      .join('\n');
  });

  return `${header}\n${eventsData.join('\n')}\n${footer}`;
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
  // don't use date.toISOString() here, it will be always one day off (cause of the timezone)
  const day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
  const month = date.getMonth() < 9 ? '0' + (date.getMonth() + 1) : (date.getMonth() + 1);
  const year = date.getFullYear();
  const hour = date.getHours() < 10 ? '0' + date.getHours() : date.getHours();
  const minutes = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
  const seconds = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds();
  return `${year}${month}${day}T${hour}${minutes}${seconds}`;
}
