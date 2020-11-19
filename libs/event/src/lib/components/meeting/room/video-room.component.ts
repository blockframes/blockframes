
import { ChangeDetectionStrategy, Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

import { displayName } from '@blockframes/utils/pipes/display-name.pipe'
import { AuthQuery } from '@blockframes/auth/+state';
import { EventQuery } from '@blockframes/event/+state';

import { Attendee, LocalAttendee, TrackKind } from '../+state/twilio.model';
import { TwilioService } from '../+state/twilio.service';
import { TwilioQuery } from '../+state/twilio.query';

@Component({
  selector: 'meeting-video-room',
  templateUrl: './video-room.component.html',
  styleUrls: ['./video-room.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MeetingVideoRoomComponent implements OnInit, OnDestroy {

  public eventId: string;

  public local$: Observable<LocalAttendee>;
  public attendees$: Observable<Attendee[]>;

  @HostListener('window:beforeunload')
  disconnect() {
    this.twilioService.disconnect();
  }

  constructor(
    private authQuery: AuthQuery,
    private eventQuery: EventQuery,
    private twilioService: TwilioService,
    private twilioQuery: TwilioQuery
  ) { }

  async ngOnInit() {
    this.eventId = this.eventQuery.getActiveId();

    this.local$ = this.twilioQuery.selectLocal();

    // TODO this is for debug purpose only, it's meant to test multiple video even with only 1 local user
    // TODO before merging this should be replaced with the commented line bellow
    // this.attendees$ = this.twilioQuery.selectAll();
    this.attendees$ = this.twilioQuery.selectMultiple(9);

    const name = displayName(this.authQuery.user, 'capitalize');
    await this.twilioService.initLocal(name);

    this.twilioService.connect(this.eventId);
  }

  ngOnDestroy() {
    this.disconnect();
  }

  toggleLocalTrack(kind: TrackKind) {
    this.twilioService.toggleTrack(kind);
  }

  quitMeeting() {
    this.twilioService.disconnect();
  }

  getRowClass(length: number) {
    return `row${Math.ceil(length / 3)}`;
  }
}
