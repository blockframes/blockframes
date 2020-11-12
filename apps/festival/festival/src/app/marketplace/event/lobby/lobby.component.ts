
import { Component, OnInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { pluck, switchMap } from 'rxjs/operators';
import { BehaviorSubject, Observable } from 'rxjs';

import { EventService, Event } from '@blockframes/event/+state';
import { TwilioService } from '@blockframes/event/components/meeting/+state/twilio.service';
import { LocalAudioTrack, LocalVideoTrack } from 'twilio-video';
import { AuthQuery } from '@blockframes/auth/+state';
import { TrackKind } from '@blockframes/event/components/meeting/+state/twilio.model';

@Component({
  selector: 'festival-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LobbyComponent implements OnInit, OnDestroy {

  public event$: Observable<Event>;

  public track$ = new BehaviorSubject<{
    video: LocalVideoTrack,
    audio: LocalAudioTrack
  }>({video: undefined, audio: undefined});

  public userName: string;

  constructor(
    private authQuery: AuthQuery,
    private eventService: EventService,
    private route: ActivatedRoute,
    private twilioService: TwilioService,
  ) { }

  ngOnInit() {

    this.userName = `${this.authQuery.user.firstName} ${this.authQuery.user.lastName}`;

    this.event$ = this.route.params.pipe(
      pluck('eventId'),
      switchMap((eventId: string) => this.eventService.queryDocs(eventId)),
    );

    this.twilioService.getLocalTrack('video').then(videoTrack => {
      const { audio } = this.track$.getValue();
      this.track$.next({video: videoTrack, audio});
    });

    this.twilioService.getLocalTrack('audio').then(audioTrack => {
      const { video } = this.track$.getValue();
      this.track$.next({video, audio: audioTrack});
    });
  }

  ngOnDestroy() {
    this.twilioService.cleanLocalTrack('video');
    this.twilioService.cleanLocalTrack('audio');
  }

  toggleLocalTrack(kind: TrackKind) {
    this.twilioService.toggleLocalTrack(kind);
  }
}
