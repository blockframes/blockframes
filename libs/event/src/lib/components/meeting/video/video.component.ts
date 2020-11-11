import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, Input, ViewChild } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AudioTrack, VideoTrack } from 'twilio-video';

@Component({
  selector: '[video] [audio] meeting-video',
  templateUrl: './video.component.html',
  styleUrls: ['./video.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'dark-theme' },
})
export class MeetingVideoComponent implements AfterViewInit {

  private _video: VideoTrack;
  get video() { return this._video; }
  @Input() set video(value: VideoTrack | undefined) {
    if (!!value) {
      this._video = value;
      this.setUpVideo();
    }
  }

  private _audio: AudioTrack;
  get audio() { return this._audio; }
  @Input() set audio(value: AudioTrack | undefined) {
    if (!!value) {
      this._audio = value;
      this.setUpAudio();
    }
  }

  @Input() name = 'Unknown User';

  isVideoDisabled$ = new BehaviorSubject<boolean>(false);
  isAudioMuted$ = new BehaviorSubject<boolean>(true); // Browser enforce Muted by default

  @ViewChild('video') videoRef: ElementRef<HTMLVideoElement>;
  get videoElement() { return this.videoRef?.nativeElement; }

  @ViewChild('audio') audioRef: ElementRef<HTMLAudioElement>;
  get audioElement() { return this.audioRef?.nativeElement; }


  ngAfterViewInit() {
    this.setUpAudio();
    this.setUpVideo();
  }

  setUpAudio() {
    if (!!this.audio && !!this.audioElement) {
      this.audio.attach(this.audioElement);
      this.toggleMute(); // Browser enforce Muted by default so we should unmute
    }
  }

  setUpVideo() {
    if (!!this.video && !!this.videoElement) {
      this.video.attach(this.videoElement);
    }
  }

  toggleMute() {
    const currentMutedValue = this.isAudioMuted$.getValue();
    this.isAudioMuted$.next(!currentMutedValue);
    this.audioElement.muted = !currentMutedValue;
  }

  toggleVideo() {
    const currentVideoValue = this.isVideoDisabled$.getValue();
    this.isVideoDisabled$.next(!currentVideoValue);
    if (currentVideoValue) {
      this.videoElement.play();
      this.videoElement.className = ''
    } else {
      this.videoElement.pause();
      this.videoElement.className = 'hidden'
    }
  }

  get userInitials() {
    return this.name.split(' ').map(name => name[0]).join('');
  }
}
