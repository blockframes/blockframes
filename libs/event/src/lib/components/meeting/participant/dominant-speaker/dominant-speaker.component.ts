import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {AbstractParticipant} from "@blockframes/event/components/meeting/participant/participant.abstract";
import { Participant as IParticipantMeeting } from 'twilio-video';

@Component({
  selector: 'event-dominant-speaker',
  templateUrl: './dominant-speaker.component.html',
  styleUrls: ['./dominant-speaker.component.css']
})
export class DominantSpeakerComponent extends AbstractParticipant implements OnInit {

  @Input() participant: IParticipantMeeting

  @ViewChild('dominantSpeakerVideo') containerDominantSpeakerVideo;

  constructor() {
    super();
  }

  ngOnInit(): void {
    console.log('=====================================')
    console.log('Dominant participant : ', this.participant)
    console.log('=====================================')
  }


  /**
   *
   * @param localPreviewTracks
   */
  makeDominantSpeakerTrack(localPreviewTracks: Array<any>){
    this.setUpCamAndMic(localPreviewTracks, true);
    this.attachTracks(localPreviewTracks, this.containerDominantSpeakerVideo.nativeElement, 'dominantSpeakerVideo')
  }

  setUpCamAndMic(tracks, boolToChange){
    if(tracks.length < 1){
      this.$camMicIsOnDataSource.next({video:false, mic:false});
    } else {
      tracks.forEach((track) => {
        this.setUpVideoAndAudio(track.kind, boolToChange)
      })
    }
  }
}
