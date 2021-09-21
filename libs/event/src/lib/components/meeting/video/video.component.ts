import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, HostBinding, Input, OnDestroy, ViewChild } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AudioTrack, VideoTrack } from 'twilio-video';
import { Tracks, TrackKind, Attendee } from '../+state/twilio.model';

@Component({
  selector: '[attendee] meeting-video',
  templateUrl: './video.component.html',
  styleUrls: ['./video.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MeetingVideoComponent implements AfterViewInit, OnDestroy {
  @HostBinding('class') theme = 'dark-theme';

  @Input() set attendee(value: Attendee) {

    this.name = value.userName;
    this.userInitials = this.name?.split(' ').map(name => name[0]).join('') ?? '?';
    this.local = value.kind === 'local';

    this.track.audio = value.tracks.audio;
    this.track.video = value.tracks.video;
    this.setUpTracks('video', 'audio');
  }

  track: Tracks = { audio: null, video: null };
  local = false;
  name = 'Unknown User';
  userInitials = '?';

  localTrackState$ = {
    video: new BehaviorSubject<boolean>(true),
    audio: new BehaviorSubject<boolean>(true),
  };

  remoteTrackState$ = {
    video: new BehaviorSubject<boolean>(false),
    audio: new BehaviorSubject<boolean>(false),
  };

  @ViewChild('video') videoRef: ElementRef<HTMLVideoElement>;
  @ViewChild('audio') audioRef: ElementRef<HTMLAudioElement>;
  get element() {
   return {
     video: this.videoRef?.nativeElement,
     audio: this.audioRef?.nativeElement,
   }
  }


  ngAfterViewInit() {
    this.setUpTracks('video', 'audio');
  }

  ngOnDestroy() {
    this.cleanTracks(this.track.video, this.track.audio);
  }

  setUpTracks(...kinds: TrackKind[]) {
    kinds.forEach(kind => {

      const track = this.track[kind];

      if (track) {

        if (track.isEnabled) {
          this.remoteTrackState$[track.kind].next(true);
          if (this.element[track.kind]) {
            if (!this.local || track.kind !== 'audio') {
              track.attach(this.element[track.kind]);
            }
            if (track.kind === 'audio' && this.element[track.kind].muted && this.localTrackState$.audio.getValue()) {
              this.element[track.kind].muted = false;
            }
          }
        }

        this.cleanTracks(track);
        track.on('enabled', (t: VideoTrack | AudioTrack) => this.remoteTrackState$[t.kind].next(t.isEnabled));
        track.on('disabled', (t: VideoTrack | AudioTrack) => this.remoteTrackState$[t.kind].next(t.isEnabled));

      } else {
        this.remoteTrackState$[kind].next(false);
      }
    });
  }

  cleanTracks(...tracks: (VideoTrack | AudioTrack | undefined)[]) {
    tracks.forEach(track => {
      if (!!track && track.listenerCount('enabled') > 0) {
        track.removeAllListeners();
      }
    });
  }

  toggleLocalState(kind: 'video' | 'audio') {

    if (this.local) return;

    if (!this.track[kind] || !this.track[kind].isEnabled) {
      this.localTrackState$[kind].next(false);
      return;
    }

    const currentValue = this.localTrackState$[kind].getValue();
    this.localTrackState$[kind].next(!currentValue);

    if (kind === 'video') {
      if (!currentValue) {
        this.element[kind].play();
        this.element[kind].className = '';
      } else {
        this.element[kind].pause();
        this.element[kind].className = 'hidden';
      }
    } else if (kind === 'audio') {
      this.element[kind].muted = currentValue;
    }
  }
}
