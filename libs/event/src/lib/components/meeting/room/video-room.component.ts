
import { ChangeDetectionStrategy, Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

import { AuthQuery } from '@blockframes/auth/+state';
import { EventQuery } from '@blockframes/event/+state';

import { Attendee } from '../+state/twilio.model';
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

  public attendees$: Observable<Attendee[]>;

  constructor(
    private authQuery: AuthQuery,
    private eventQuery: EventQuery,
    private twilioService: TwilioService,
    private twilioQuery: TwilioQuery,
  ) { }

  ngOnInit() {
    this.eventId = this.eventQuery.getActiveId();

    this.attendees$ = this.twilioQuery.selectAll();

    this.twilioService.initLocal(
      `${this.authQuery.user.firstName} ${this.authQuery.user.lastName}`
    ).then(() => this.twilioService.connect(this.eventId));

  }

  ngOnDestroy() {
    this.disconnect();
  }

  @HostListener('window:beforeunload')
  disconnect() {
    this.twilioService.disconnect();
  }

}
