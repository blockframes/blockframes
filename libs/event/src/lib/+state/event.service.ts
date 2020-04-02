import { Injectable } from '@angular/core';
import { CollectionConfig, CollectionService, syncQuery, Query } from 'akita-ng-fire';
import { EventState, EventStore } from './event.store';
import { Event, ScreeningEvent, createPrivateEventConfig } from './event.model';
import { QueryFn } from '@angular/fire/firestore/interfaces';
import { Observable } from 'rxjs';
import { AngularFireFunctions } from '@angular/fire/functions/functions';
import { EventPrivateConfig } from './event.firestore';

const screeningsQuery = (queryFn?: QueryFn): Query<ScreeningEvent> => ({
  path: 'events',
  queryFn,
  movie: (event: ScreeningEvent) => ({ path: `movies/${event.meta.titleId}` })
});

@Injectable({ providedIn: 'root' })
@CollectionConfig({ path: 'events' })
export class EventService extends CollectionService<EventState> {

  constructor(
    store: EventStore,
    private functions: AngularFireFunctions
  ) {
    super(store);
  }

  formatToFirestore(event: Event) {
    const e = { ...event };
    // Remove frontend values
    delete e.draggable;
    delete e.resizable;
    delete e.color;
    delete e.cssClass;
    delete e.isOwner;
    return e;
  }

  syncScreenings(queryFn?: QueryFn): Observable<ScreeningEvent[]> {
    return syncQuery.call(this, screeningsQuery(queryFn));
  }

  /**
   * Set event private url
   * @param eventId 
   * @param url 
   * @param userId
   */
  public setEventUrl(eventId: string, url: string, userId: string): Promise<any> {
    // @TODO #2244 implement this callable function
    // It will check if userId is allowed to push data
    // (ie: owner of event)
    // If yes, it will save the url into docIndex collection with docId==eventId
    const f = this.functions.httpsCallable('setEventUrl');
    const eventConfig = createPrivateEventConfig({ url });
    return f({ eventId, eventConfig, userId }).toPromise();
  }

  /**
   * Set event private url
   * @param eventId 
   * @param userId 
   */
  public getEventUrl(eventId: string, userId: string): Promise<string> {
    // @TODO #2244 implement this callable function
    // The function should check if userId have an invitation
    // And if the current date is in event scope
    // If yes, we check into docIndex collection to find
    // private config for this documentId (eventId)
    const f = this.functions.httpsCallable('getEventUrl');
    return f({ eventId, userId }).toPromise()
      .then((eventConfig: EventPrivateConfig) => {
        // @TODO #2244 
        return eventConfig.url; // 'http://foo.bar/movie.mp4';
      });
  }
}
