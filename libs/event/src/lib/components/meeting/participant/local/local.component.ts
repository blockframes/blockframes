// Angular
import {AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';

// Blockframes
import {IParticipantMeeting, meetingEventEnum} from "@blockframes/event/components/meeting/+state/meeting.interface";
import {MeetingService} from "@blockframes/event/components/meeting/+state/meeting.service";

// Twilio
import {LocalAudioTrack, LocalParticipant, LocalTrack, LocalTrackPublication, LocalVideoTrack} from 'twilio-video';


@Component({
  selector: '[isOpen] [localParticipant] [twilioData] event-meeting-local-participant',
  templateUrl: './local.component.html',
  styleUrls: ['./local.component.scss']
})
export class LocalComponent implements OnInit, AfterViewInit, OnDestroy {

  @Input() isOpen: boolean;
  @Input() localParticipant: IParticipantMeeting;
  @Input() twilioData: LocalParticipant

  @ViewChild('video') video: ElementRef;
  @ViewChild('audio') audio: ElementRef;

  open = true;

  constructor(private meetingService: MeetingService) {
  }

  ngOnInit(): void {
    // FIXME
    // this.open = !this.isSeller;
  }

  ngAfterViewInit() {
    this.setUpLocalParticipantEvent(this.twilioData);
    this.attachTracks(this.meetingService.getParticipantTracks(this.twilioData) as LocalTrack[]);
  }

  /**
   *
   * @param localParticipant
   */
  setUpLocalParticipantEvent(localParticipant: LocalParticipant) {

    localParticipant.on(meetingEventEnum.TrackDisabled, (track: LocalTrackPublication) => {
      this.setupVideoAudio(track.kind, false);
    })

    localParticipant.on(meetingEventEnum.TrackEnabled, (track: LocalTrackPublication) => {
      this.setupVideoAudio(track.kind, true);
    })

    localParticipant.on(meetingEventEnum.TrackStopped, (track: LocalTrackPublication) => {
      this.setupVideoAudio(track.kind, false);
    })
  }

  setupVideoAudio(kind, boolToChange) {
    this.meetingService.setupVideoAudio(this.localParticipant.identity, kind, boolToChange);
  }

  /**
   * Attach the Tracks to the DOM.
   * @param tracks - track to attach in the container
   */
  attachTracks(tracks: LocalTrack[]): void {
    tracks.forEach((track: (LocalAudioTrack | LocalVideoTrack)) => {
      if (track) {
        track.attach((track.kind === 'video') ? this.video.nativeElement : this.audio.nativeElement);
      }
    });
  }

  /**
   *  Detach the Tracks from the DOM.
   * @param tracks - track to detach of the DOM
   */
  detachTracks(tracks: LocalTrack[]): void {
    tracks.forEach((track: (LocalAudioTrack | LocalVideoTrack)) => {
      if (track) {
        track.detach((track.kind === 'video') ? this.video.nativeElement : this.audio.nativeElement);
      }
    });
  }

  ngOnDestroy() {
    this.detachTracks(this.meetingService.getParticipantTracks(this.twilioData) as LocalTrack[]);
    this.twilioData.removeAllListeners();
  }
}
