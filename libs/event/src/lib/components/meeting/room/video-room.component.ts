
import { ChangeDetectionStrategy, Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { displayName } from '@blockframes/utils/utils'
import { AuthQuery, AuthService } from '@blockframes/auth/+state';
import { Attendee, LocalAttendee, TrackKind } from '../+state/twilio.model';
import { TwilioService } from '../+state/twilio.service';
import { TwilioQuery } from '../+state/twilio.query';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'meeting-video-room',
  templateUrl: './video-room.component.html',
  styleUrls: ['./video-room.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MeetingVideoRoomComponent implements OnInit, OnDestroy {

  public local$: Observable<LocalAttendee>;
  public attendees$: Observable<Attendee[]>;

  @HostListener('window:beforeunload')
  disconnect() {
    this.twilioService.disconnect();
  }

  constructor(
    private authQuery: AuthQuery,
    private authService: AuthService,
    private twilioService: TwilioService,
    private twilioQuery: TwilioQuery,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  async ngOnInit() {
    const eventId: string = this.route.snapshot.params.eventId;

    this.local$ = this.twilioQuery.selectLocal();

    this.attendees$ = this.twilioQuery.selectAll();

    const name = displayName(this.authQuery.user || this.authService.anonymousCredentials);
    await this.twilioService.initLocal(name);

    this.twilioService.connect(eventId, this.authQuery.user || this.authService.anonymousCredentials);
  }

  ngOnDestroy() {
    this.disconnect();
  }

  toggleLocalTrack(kind: TrackKind) {
    this.twilioService.toggleTrack(kind);
  }

  async quitMeeting() {
    const hasConfirmed = await this.router.navigate(['..', 'ended'], { relativeTo: this.route });
    if (hasConfirmed) this.twilioService.disconnect();
  }
}
