import { Component, OnInit, ChangeDetectionStrategy, OnDestroy, HostListener } from '@angular/core';
import { EventService, Event, EventQuery } from '@blockframes/event/+state';
import { Observable, Subscription } from 'rxjs';
import { AttendeeStatus, Meeting, Screening } from '@blockframes/event/+state/event.firestore';
import { MovieService } from '@blockframes/movie/+state/movie.service';
import { AuthQuery } from '@blockframes/auth/+state/auth.query';
import { MatBottomSheet } from '@angular/material/bottom-sheet'
import { DoorbellBottomSheetComponent } from '@blockframes/event/components/doorbell/doorbell.component';
import { UserService } from '@blockframes/user/+state/user.service';
import { Router } from '@angular/router';


@Component({
  selector: 'festival-session',
  templateUrl: './session.component.html',
  styleUrls: ['./session.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SessionComponent implements OnInit, OnDestroy {

  public event$: Observable<Event>;
  public showSession = true;
  public ownerIsPresent = false;
  public mediaContainerSize: string;
  public visioContainerSize: string;
  public screeningFileRef: string;

  private sub: Subscription;

  @HostListener('window:beforeunload')
  attendeeLeaves() {
    const event = this.eventQuery.getActive();
    if (event.type === 'meeting') {
      const meta: Meeting = { ...event.meta, attendees: {...event.meta.attendees} };
      if (event.isOwner) {
        const newAttendees: Record<string, AttendeeStatus> = {};
        Object.keys(meta.attendees).forEach(uid => newAttendees[uid] = 'ended');
        meta.attendees = newAttendees;
        this.service.update(event.id, { meta });
      } else if (!!meta.attendees[this.authQuery.userId]) {
        meta.attendees[this.authQuery.userId] = 'ended';
        this.service.update(event.id, { meta });
      }
    }
  }

  constructor(
    private eventQuery: EventQuery,
    private service: EventService,
    private movieService: MovieService,
    private authQuery: AuthQuery,
    private bottomSheet: MatBottomSheet,
    private userService: UserService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.service.startLocalSession();
    this.event$ = this.service.queryDocs(this.eventQuery.getActiveId());
    this.sub = this.event$.subscribe(async event => {
      const fileSelected = !!event?.meta?.selectedFile;
      if (!fileSelected) {
        this.visioContainerSize = '100%';
      } else if (event.isOwner) {
        this.mediaContainerSize = '40%';
        this.visioContainerSize = '60%';
      } else {
        this.mediaContainerSize = '60%';
        this.visioContainerSize = '40%';
      }

      if (event.type === 'screening') {
        if (!!(event.meta as Screening).titleId) {
          const movie = await this.movieService.getValue(event.meta.titleId as string);
          this.screeningFileRef = movie.promotional.videos?.screener?.ref ?? '';
          console.log("~M:>", movie, this.screeningFileRef);
        }
      } else if (event.type === 'meeting') {
        const uid = this.authQuery.userId;
        if (event.isOwner) {
          const attendees = (event.meta as Meeting).attendees;
          if (attendees[uid] !== 'owner') {
            const meta: Meeting = { ...event.meta, attendees: { ...event.meta.attendees, [uid]: 'owner' }};
            this.service.update(event.id, { meta });
          }

          const requestUids = Object.keys(attendees).filter(userId => attendees[userId] === 'requesting');
          const requests = await this.userService.getValue(requestUids);
          if (!!requests.length) {
            this.bottomSheet.open(DoorbellBottomSheetComponent, { data: { eventId: event.id, requests}, hasBackdrop: false });
          }
        } else {
          const userStatus = (event.meta as Meeting).attendees[uid];

          if (!userStatus || userStatus === 'ended') { // meeting session is over
            this.router.navigateByUrl(`/c/o/marketplace/event/${event.id}/ended`);
          } else if (userStatus !== 'accepted') { // user has been banned or something else
            this.router.navigateByUrl(`/c/o/marketplace/event/${event.id}/lobby`);
          }
        }
      }
    })
  }

  ngOnDestroy() {
    this.attendeeLeaves();
    this.sub.unsubscribe();
  }
}
