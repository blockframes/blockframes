import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { InvitationQuery, Invitation } from '@blockframes/invitation/+state';
import { ImgRef } from '@blockframes/utils/media/media.firestore';
import { ScreeningEvent } from '../../+state';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'event-screening-item',
  templateUrl: './screening-item.component.html',
  styleUrls: ['./screening-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ScreeningItemComponent {
  public poster: ImgRef;
  public screening: ScreeningEvent;
  public invitation$: Observable<Invitation>;

  @Input() set event(screening: ScreeningEvent) {
    this.screening = screening;
    this.poster = screening.movie?.promotionalElements.poster[0].media;
    this.invitation$ = this.invitationQuery.selectAll().pipe(
      map(invits => invits.find(e => e.docId === screening.id))
    );
  }

  constructor(private invitationQuery: InvitationQuery) { }

}
