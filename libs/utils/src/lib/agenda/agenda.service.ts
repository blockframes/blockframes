import { Injectable } from '@angular/core';
import { Event, createIcsFromEvent, IcsEvent, toIcsFile, appName, toIcsDate } from '@blockframes/model';
import { OrganizationService } from '@blockframes/organization/service';
import { applicationUrl, sendgridEmailsFrom } from '../apps';

const googleCalendarLink = 'https://www.google.com/calendar/event';

function toGoogleLink(icsEvent: IcsEvent) {
  if (!icsEvent) return;
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

function downloadIcs(icsEvents: IcsEvent[], filename = 'events.ics') {
  const data = toIcsFile(icsEvents, applicationUrl.festival);
  const element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(data));
  element.setAttribute('download', filename);
  element.setAttribute('target', '_blank');
  element.style.display = 'none';
  element.click();
}

@Injectable({ providedIn: 'root' })
export class AgendaService {

  constructor(
    private orgService: OrganizationService
  ) { }

  public async download(events: Event[]) {
    if (events.length === 0) return;
    const filename = events.length > 1 ? 'events.ics' : `${events[0].title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.ics`;
    const promises = events.map(async event => {
      const ownerOrg = await this.orgService.getValue(event.ownerOrgId);
      return createIcsFromEvent(event, sendgridEmailsFrom.festival.email, ownerOrg.name);
    }).filter(e => !!e);

    const icsEvents = await Promise.all(promises);
    downloadIcs(icsEvents, filename);
  }

  public link(event: Event) {
    const icsEvent = createIcsFromEvent(event, sendgridEmailsFrom.festival.email);
    return toGoogleLink(icsEvent);
  }
}

