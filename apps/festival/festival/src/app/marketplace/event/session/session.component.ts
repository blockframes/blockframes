import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EventService, Event } from '@blockframes/event/+state';
import { pluck, switchMap, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Screening } from '@blockframes/event/+state/event.firestore';
import { MovieService } from '@blockframes/movie/+state/movie.service';
import { InvitationQuery } from '@blockframes/invitation/+state/invitation.query';
import { InvitationService } from '@blockframes/invitation/+state';
import { AuthQuery } from '@blockframes/auth/+state/auth.query';


@Component({
  selector: 'festival-session',
  templateUrl: './session.component.html',
  styleUrls: ['./session.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SessionComponent implements OnInit {

  public event$: Observable<Event>;
  public showSession = true;
  public mediaContainerSize: string;
  public visioContainerSize: string;
  public screeningFileRef: string;

  constructor(
    private service: EventService,
    private route: ActivatedRoute,
    private movieService: MovieService,
    private invitationService: InvitationService,
    private invitationQuery: InvitationQuery,
    private authQuery: AuthQuery
  ) { }

  ngOnInit(): void {
    this.event$ = this.route.params.pipe(
      pluck('eventId'),
      switchMap((eventId: string) => this.service.queryDocs(eventId)),
      tap(async event => {
        if (event.isOwner) {
          this.mediaContainerSize = '40%';
          this.visioContainerSize = '60%';
        } else {
          this.mediaContainerSize = '60%';
          this.visioContainerSize = '40%';
        }

        // PLAN A: set invitation to event

        /**
         * Audience requested to participate
         * Therefore isInvitationRecepient === false for audience
         * Only the Organizer (orgmember) has rights to edit the invitation
         * 
         * We could allow the creator to edit the invitation too in the firestore rules
         */

        // apperently invitation is both on the organizer as on the receiver's store
        const invitations = this.invitationQuery.getAll().filter(invitation => invitation.docId === event.id)
        for (let invitation of invitations) {
          // if status is accepted
          // and the user is either fromUser and requested to attend, or toUser and invited
          if (invitation.status === 'accepted' && 
            (invitation.mode === 'request' && invitation.fromUser?.uid === this.authQuery.userId) ||
            (invitation.mode === 'invitation' && invitation.toUser?.uid === this.authQuery.userId)) {
            await this.invitationService.update(invitation.id, { status: 'attended' });
          }
        }

        if (event.type === 'screening') {
          if (!!(event.meta as Screening).titleId) {
            const movie = await this.movieService.getValue(event.meta.titleId as string)
            this.screeningFileRef = movie.promotional.videos?.screener?.ref ?? '';
          }
        }
      }),
    );
  }
}
