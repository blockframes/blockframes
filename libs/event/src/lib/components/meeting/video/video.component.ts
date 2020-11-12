import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, Input, OnDestroy, ViewChild } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AudioTrack, VideoTrack } from 'twilio-video';
import { TrackKind } from '../+state/twilio.model';

@Component({
  selector: '[video] [audio] meeting-video',
  templateUrl: './video.component.html',
  styleUrls: ['./video.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'dark-theme' },
})
export class MeetingVideoComponent implements AfterViewInit, OnDestroy {

  private _video: VideoTrack;
  @Input() set video(value: VideoTrack | undefined) {
    if (!!value) {
      this._video = value;
      this.setUpTracks({track: this.track.video, kind: 'video'});
    }
  }

  private _audio: AudioTrack;
  @Input() set audio(value: AudioTrack | undefined) {
    if (!!value) {
      this._audio = value;
      this.setUpTracks({track: this.track.audio, kind: 'audio'});
    }
  }

  get track() {
    return {
      video: this._video,
      audio: this._audio,
    };
  }

  public _local: boolean;
  @Input()
  get local() { return this._local; }
  /**
   * The component is used to display the local user,
   * the inner controls will be hidden since they should be handled by the service,
   * the audio tag is disable to avoid echo
   */
  set local(value: boolean) {
    this._local = coerceBooleanProperty(value);
  }

  @Input() name = 'Unknown User';

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
    this.setUpTracks(
      {track: this.track.video, kind: 'video'},
      {track: this.track.audio, kind: 'audio'},
    );
  }

  ngOnDestroy() {
    this.cleanTracks(this.track.video, this.track.audio);
  }

  setUpTracks(...trackAndKinds: { track: (VideoTrack | AudioTrack | undefined), kind: TrackKind}[]) {
    trackAndKinds.forEach(trackAndKind => {
      const { track } = trackAndKind;

      if (!!track) {

        if (track.isEnabled) {
          this.remoteTrackState$[track.kind].next(true);
          if (!!this.element[track.kind]) {
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
        this.remoteTrackState$[trackAndKind.kind].next(false);
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

  get userInitials() {
    return this.name.split(' ').map(name => name[0]).join('');
  }
}
