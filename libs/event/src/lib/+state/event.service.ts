import { Injectable } from '@angular/core';
import { CollectionConfig, CollectionService, syncQuery, Query } from 'akita-ng-fire';
import { EventState, EventStore } from './event.store';
import { Event, ScreeningEvent } from './event.model';
import { QueryFn } from '@angular/fire/firestore/interfaces';
import { Observable } from 'rxjs';
import { AngularFireFunctions } from '@angular/fire/functions';

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
   * The url will be fetched from Movie private config associated to eventId
   * @param eventId 
   */
  public setEventUrl(eventId: string): Promise<any> {
    const f = this.functions.httpsCallable('setEventUrl');
    return f({ eventId }).toPromise();
  }

  /**
   * Get event private url
   * @param eventId 
   */
  public getEventUrl(eventId: string): Promise<string> {
    const f = this.functions.httpsCallable('getEventUrl');
    return f({ eventId }).toPromise();
  }

  /**
   * @dev ADMIN method
   * Get all contracts.
   */
  public async getAllEvents(): Promise<Event[]> {
    const contractsSnap = await this.db
      .collection('events')
      .get()
      .toPromise();
    return contractsSnap.docs.map(c => c.data() as Event );
  }
}
