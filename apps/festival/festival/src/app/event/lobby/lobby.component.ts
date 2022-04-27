
import { Component, OnInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { EventService } from '@blockframes/event/service';
import { TwilioService } from '@blockframes/event/components/meeting/+state/twilio.service';
import { AuthService } from '@blockframes/auth/service';
import { LocalAttendee, TrackKind } from '@blockframes/event/components/meeting/+state/twilio.model';
import { displayName } from '@blockframes/utils/utils';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { pluck, switchMap } from 'rxjs/operators';
import { createMeetingAttendee, Event, AttendeeStatus, Meeting } from '@blockframes/model';

@Component({
  selector: 'festival-event-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LobbyComponent implements OnInit, OnDestroy {

  public event$: Observable<Event>;
  private event: Event<Meeting>;
  public local$: Observable<LocalAttendee>;
  public ownerIsPresent = false;
  public attendeeStatus: AttendeeStatus;
  private sub: Subscription;

  constructor(
    private authService: AuthService,
    private eventService: EventService,
    private route: ActivatedRoute,
    private router: Router,
    private twilioService: TwilioService,
    private dynTitle: DynamicTitleService,
  ) { }

  ngOnInit() {
    this.event$ = this.route.params.pipe(
      pluck('eventId'),
      switchMap((eventId: string) => this.eventService.valueChanges(eventId)),
    );

    this.local$ = this.twilioService.localAttendee$;
    const name = displayName(this.authService.anonymouseOrRegularProfile);
    this.twilioService.initLocal(name);

    this.sub = this.event$.subscribe((e) => {
      this.event = e as Event<Meeting>;
      if (this.event.type === 'meeting') {
        this.dynTitle.setPageTitle(this.event.title, 'Lobby');
        const attendees = (this.event.meta as Meeting).attendees;
        this.ownerIsPresent = Object.values(attendees).some(value => value.status === 'owner');
        this.attendeeStatus = this.event.isOwner ? 'owner' : attendees[this.authService.uid]?.status;
        if (this.attendeeStatus === 'accepted') {
          this.router.navigate(['../', 'session'], { relativeTo: this.route });
        }
      }
    })
  }

  ngOnDestroy() {
    this.twilioService.cleanLocal();
    this.sub.unsubscribe();
  }

  toggleLocalTrack(kind: TrackKind) {
    this.twilioService.toggleTrack(kind);
    this.twilioService.togglePreference(kind); // save the user choice for the session page
  }

  requestAccess() {
    const attendee = createMeetingAttendee(this.authService.anonymouseOrRegularProfile, 'requesting');
    const meta: Meeting = { ...this.event.meta, attendees: { ...this.event.meta.attendees, [this.authService.uid]: attendee } };
    this.eventService.update(this.event.id, { meta });
  }
}
