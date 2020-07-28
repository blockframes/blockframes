import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { InvitationQuery, Invitation } from '@blockframes/invitation/+state';
import { HostedMedia } from '@blockframes/media/+state/media.firestore';
import { ScreeningEvent } from '../../+state';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Movie } from '@blockframes/movie/+state';

@Component({
  selector: 'event-screening-item',
  templateUrl: './screening-item.component.html',
  styleUrls: ['./screening-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ScreeningItemComponent {
  public poster: HostedMedia;
  public movie: Movie;
  public screening: ScreeningEvent;
  public invitation$: Observable<Invitation>;

  @Input() set event(screening: ScreeningEvent) {
    this.screening = screening;
    this.movie = screening.movie;
    this.poster = screening.movie?.poster.media;
    this.invitation$ = this.invitationQuery.selectAll().pipe(
      map(invits => invits.find(e => e.docId === screening.id))
    );
  }

  constructor(private invitationQuery: InvitationQuery) { }

}
