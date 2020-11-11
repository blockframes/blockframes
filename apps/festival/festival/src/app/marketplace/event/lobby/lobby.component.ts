
import { Component, OnInit, ChangeDetectionStrategy, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { pluck, switchMap, tap } from 'rxjs/operators';
import { BehaviorSubject, Observable } from 'rxjs';

import { EventService, Event } from '@blockframes/event/+state';
import { TwilioService } from '@blockframes/event/components/meeting/+state/twilio.service';
import { LocalAudioTrack, LocalVideoTrack } from 'twilio-video';

@Component({
  selector: 'festival-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LobbyComponent implements OnInit, OnDestroy {

  public event$: Observable<Event>;

  public videoTrack$ = new BehaviorSubject<LocalVideoTrack>(undefined);
  public audioTrack$ = new BehaviorSubject<LocalAudioTrack>(undefined);


  constructor(
    private service: EventService,
    private route: ActivatedRoute,
    private twilioService: TwilioService,
  ) { }

  ngOnInit() {
    this.event$ = this.route.params.pipe(
      pluck('eventId'),
      switchMap((eventId: string) => this.service.queryDocs(eventId)),
    );

    this.twilioService.getLocalVideoTrack().then(videoTrack => {
      this.videoTrack$.next(videoTrack);
    });

    this.twilioService.getLocalAudioTrack().then(audioTrack => {
      audioTrack?.disable();
      this.audioTrack$.next(audioTrack);
    });
  }

  ngOnDestroy() {
    this.twilioService.cleanLocalAudio();
    this.twilioService.cleanLocalVideo();
  }

  toggleVideo() {
    this.twilioService.toggleVideo();
  }

  toggleAudio() {
    this.twilioService.toggleAudio();
  }
}
