import { Injectable } from "@angular/core";
import { Event, isMeeting, isScreening } from '@blockframes/event/+state/event.model';
import { OrganizationService, orgName } from "@blockframes/organization/+state";
import { sendgridEmailsFrom } from "../apps";
import { IcsEvent } from "./ics.interfaces";
import { downloadIcs, toGoogleLink } from "./utils";

@Injectable({ providedIn: 'root' })
export class IcsService {

  constructor(
    private orgService: OrganizationService
  ) { }

  public async download(events: Event[]) {
    const filename = events.length > 1 ? 'events.ics' : 'event.ics';
    const promises = events.map(async event => {
      const ownerOrg = await this.orgService.getValue(event.ownerOrgId);
      return createIcsFromEvent(event, orgName(ownerOrg, 'full'));
    }).filter(e => !!e);

    const icsEvents = await Promise.all(promises);
    downloadIcs(icsEvents, filename);
  }

  public link(event: Event) {
    const icsEvent = createIcsFromEvent(event);
    return toGoogleLink(icsEvent);
  }
}

function createIcsFromEvent(e: Event, orgName?: string): IcsEvent {
  const event = isScreening(e) || isMeeting(e) ? e : undefined;
  if (!event) return;
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
