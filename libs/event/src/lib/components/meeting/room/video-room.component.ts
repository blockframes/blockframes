
import { ChangeDetectionStrategy, Component, ElementRef, HostListener, Inject, OnDestroy, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { displayName } from '@blockframes/utils/utils'
import { AuthService } from '@blockframes/auth/+state';
import { Attendee, LocalAttendee, TrackKind } from '../+state/twilio.model';
import { TwilioService } from '../+state/twilio.service';
import { ActivatedRoute, Router } from '@angular/router';
import { toggleFullScreen } from '@blockframes/media/file/viewers/utils';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'meeting-video-room',
  templateUrl: './video-room.component.html',
  styleUrls: ['./video-room.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MeetingVideoRoomComponent implements OnInit, OnDestroy {
  fullScreen = false;
  public local$: Observable<LocalAttendee>;
  public attendees$: Observable<Attendee[]>;

  /** Keep track of wether the player is in full screen or not.
   * We cannot trust the `toggleFullScreen()` function for that because
   * full screen can be exited without our button (Escape key, etc...)
   */
  @HostListener('fullscreenchange')
  @HostListener('webkitfullscreenchange')
  @HostListener('mozfullscreenchange')
  trackFullScreenMode() {
    this.fullScreen = !this.fullScreen;
  }

  @HostListener('window:beforeunload')
  disconnect() {
    this.twilioService.disconnect();
  }

  constructor(
    private authService: AuthService,
    private twilioService: TwilioService,
    private router: Router,
    private route: ActivatedRoute,
    private el: ElementRef,
    @Inject(DOCUMENT) private document: Document,
  ) { }

  async ngOnInit() {
    const eventId: string = this.route.snapshot.params.eventId;

    this.local$ = this.twilioService.localAttendee$;

    this.attendees$ = this.twilioService.attendees$;

    const name = displayName(this.authService.anonymouseOrRegularProfile);
    await this.twilioService.initLocal(name);

    this.twilioService.connect(eventId, this.authService.anonymouseOrRegularProfile);
  }

  ngOnDestroy() {
    this.disconnect();
  }

  toggleLocalTrack(kind: TrackKind) {
    this.twilioService.toggleTrack(kind);
  }

  toggleFullScreen() {
    toggleFullScreen(this.el, this.document, this.fullScreen);
  }

  async quitMeeting() {
    const hasConfirmed = await this.router.navigate(['..', 'ended'], { relativeTo: this.route });
    if (hasConfirmed) this.twilioService.disconnect();
  }
}
