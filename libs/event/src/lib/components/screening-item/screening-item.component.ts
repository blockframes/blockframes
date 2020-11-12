import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { InvitationQuery, Invitation } from '@blockframes/invitation/+state';
import { ScreeningEvent } from '../../+state';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Movie } from '@blockframes/movie/+state';
import { AuthQuery } from '@blockframes/auth/+state';

@Component({
  selector: 'event-screening-item',
  templateUrl: './screening-item.component.html',
  styleUrls: ['./screening-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ScreeningItemComponent {
  public poster: string;
  public movie: Movie;
  public screening: ScreeningEvent;
  public invitation$: Observable<Invitation>;
  public uid = this.authQuery.userId;

  @Input() set event(screening: ScreeningEvent) {
    this.screening = screening;
    this.movie = screening.movie;
    this.poster = screening.movie?.poster;
    this.invitation$ = this.invitationQuery.selectAll().pipe(
      map(invits => invits.find(e => {
        return e.docId === screening.id && (
          (e.mode === 'request' && e.fromUser.uid === this.uid) ||
          (e.mode === 'invitation' && e.toUser.uid === this.uid)
        );
      }))
    );
  }

  constructor(
    private invitationQuery: InvitationQuery,
    private authQuery: AuthQuery
  ) { }

}
