import { Injectable } from "@angular/core";
import { Event, isMeeting, isScreening } from '@blockframes/event/+state/event.model';
import { IcsEvent } from "./ics.interfaces";
import { downloadIcs } from "./utils";

@Injectable({ providedIn: 'root' })
export class IcsService {

  public download(events: Event[], filename = 'events.ics') {
    const icsEvents = events.map(e => createIcsFromEvent(e));
    downloadIcs(icsEvents, filename);
  }
}

function createIcsFromEvent(e: Event): IcsEvent {
  const event = isScreening(e) || isMeeting(e) ? e : undefined;
  if (!event) return;
  return {
    id: event.id,
    title: event.title,
    start: event.start,
    end: event.end,
    description: event.meta.description,
    organizer: {
      name: 'orgName', // @TODO #4045
      email: 'todo@gmail.com'
    }
  }
}
