import { Component, OnInit, ChangeDetectionStrategy, OnDestroy, HostListener } from '@angular/core';
import { EventService, Event, EventQuery } from '@blockframes/event/+state';
import { Observable, Subscription } from 'rxjs';
import { Meeting, Screening } from '@blockframes/event/+state/event.firestore';
import { MovieService } from '@blockframes/movie/+state/movie.service';
import { AuthQuery } from '@blockframes/auth/+state/auth.query';
import { MatBottomSheet } from '@angular/material/bottom-sheet'
import { DoorbellBottomSheetComponent } from '@blockframes/event/components/doorbell/doorbell.component';
import { UserService } from '@blockframes/user/+state/user.service';


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

  private event: Event;
  private sub: Subscription;

  constructor(
    private eventQuery: EventQuery,
    private service: EventService,
    private movieService: MovieService,
    private authQuery: AuthQuery,
    private bottomSheet: MatBottomSheet,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    this.event$ = this.eventQuery.selectActive();
    this.sub = this.event$.subscribe(async event => {
      this.event = event;
      if (event.isOwner) {
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
        }
      } else if (event.type === 'meeting' && event.isOwner) {
        const uid = this.authQuery.userId;
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
      }
    })
  }

  ngOnDestroy() {
    this.attendeeLeaves();
    this.sub.unsubscribe();
  }

  @HostListener('window:beforeunload')
  attendeeLeaves() {
    if (this.event.type === 'meeting') {
      const meta: Meeting = { ...this.event.meta, attendees: {...this.event.meta.attendees} };
      if (this.event.isOwner) {
        meta.attendees = {};
      } else if (!!meta.attendees[this.authQuery.userId]) {
        delete meta.attendees[this.authQuery.userId];
      }
      this.service.update(this.event.id, { meta });
    }
  }
}
