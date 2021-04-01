import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { InvitationQuery, Invitation } from '@blockframes/invitation/+state';
import { ScreeningEvent } from '../../+state';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { StorageFile } from '@blockframes/media/+state/media.firestore';

@Component({
  selector: 'event-screening-item',
  templateUrl: './screening-item.component.html',
  styleUrls: ['./screening-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ScreeningItemComponent {
  public poster: StorageFile;
  public screening: ScreeningEvent;
  public invitation$: Observable<Invitation>;
  private _event = new BehaviorSubject<ScreeningEvent>(null);
  event$ = this._event.asObservable();

  @Input() set event(screening: ScreeningEvent) {
    this._event.next(screening);
    this.screening = screening;
    this.poster = screening.movie?.poster;
    this.invitation$ = this.invitationQuery.whereCurrentUserIsGuest().pipe(
      map(invits => invits.find(e => e.eventId === screening.id))
    );
  }
  get event() {
    return this._event.getValue();
  }

  constructor(private invitationQuery: InvitationQuery) { }

}
