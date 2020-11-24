
import { Component, OnInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';

import { Observable } from 'rxjs';

import { Event, EventQuery } from '@blockframes/event/+state';
import { TwilioService } from '@blockframes/event/components/meeting/+state/twilio.service';
import { AuthQuery } from '@blockframes/auth/+state';
import { LocalAttendee, TrackKind, } from '@blockframes/event/components/meeting/+state/twilio.model';
import { TwilioQuery } from '@blockframes/event/components/meeting/+state/twilio.query';
import { displayName } from '@blockframes/utils/utils';

@Component({
  selector: 'festival-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LobbyComponent implements OnInit, OnDestroy {

  public event$: Observable<Event>;

  public local$: Observable<LocalAttendee>;

  constructor(
    private authQuery: AuthQuery,
    private eventQuery: EventQuery,
    private twilioService: TwilioService,
    private twilioQuery: TwilioQuery,
  ) { }

  ngOnInit() {
    this.event$ = this.eventQuery.selectActive();
    this.local$ = this.twilioQuery.selectLocal();
    const name = displayName(this.authQuery.user);
    this.twilioService.initLocal(name);
  }

  ngOnDestroy() {
    this.twilioService.cleanLocal();
  }

  toggleLocalTrack(kind: TrackKind) {
    this.twilioService.toggleTrack(kind);
  }
}
