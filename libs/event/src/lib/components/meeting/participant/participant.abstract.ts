import {BehaviorSubject, Observable} from "rxjs";
import {ChangeDetectorRef} from "@angular/core";
import { Participant, RemoteTrackPublication, RemoteAudioTrack, RemoteVideoTrack } from 'twilio-video';
import {StatusVideoMic} from "@blockframes/event/components/meeting/+state/meeting.service";

export abstract class AbstractParticipant{

  protected $camMicIsOnDataSource: BehaviorSubject<StatusVideoMic> = new BehaviorSubject({video: false, audio: false});
  public camMicIsOn$: Observable<StatusVideoMic> = this.$camMicIsOnDataSource.asObservable();

  protected constructor(protected cd: ChangeDetectorRef) {
    this.$camMicIsOnDataSource.next({video: false, audio: false})
  }

  /**
   * Attach the Tracks to the DOM.
   * @param tracks - track to attach in the container
   * @param container - container from DOM to attach the track
   * @param className - name of class css
   */
  attachTracks(tracks, container, className) {
    tracks.forEach((track) => {
      if (track) {
        container.appendChild(track.attach()).className = className;
      }
    });
  }

  /**
   * Attach the Participant's Tracks to the DOM.
   * @param participant - participant to attach in the container
   * @param container - container of participant in DOM
   * @param nameClass - name of class css
   */
  attachParticipantTracks(participant: Participant, container, nameClass) {
    const tracks = Array.from(participant.tracks.values()).map((
      trackPublication : any
    ) => {
      return trackPublication.track;
    });
    this.attachTracks(tracks, container, nameClass);
  }

  /**
   *  etach the Tracks from the DOM.
   * @param tracks - track to detach of the DOM
   */
  detachTracks(tracks) {
    tracks.forEach((track) => {
      if (track) {
        this.setUpVideoAndAudio(track.kind, false);
        track.detach().forEach((detachedElement) => {
          detachedElement.remove();
        });
      }
    });
  }

  /**
   *
   * @param trackPublication
   */
  getTrackFromRemoteTrackPublication(trackPublication:RemoteTrackPublication): RemoteVideoTrack|RemoteAudioTrack {
    return trackPublication.track;
  }

  /**
   * Detach the Participant's Tracks from the DOM.
   * @param participant - participant to detach track of the DOM
   */
  detachParticipantTracks(participant: Participant) {
    const tracks = Array.from(participant.tracks.values()).map((
      trackPublication : any
    ) => {
      return trackPublication.track;
    });
    this.detachTracks(tracks);
  }

  setUpVideoAndAudio(kind, boolToChange){
    if(kind === 'video'){
      this.$camMicIsOnDataSource.next( {...this.$camMicIsOnDataSource.getValue(), video: boolToChange});
    } else {
      this.$camMicIsOnDataSource.next( {...this.$camMicIsOnDataSource.getValue(), audio: boolToChange});
    }
    this.cd.detectChanges();
  }


  /**
   *
   * @param participant
   */
  getFirstAndLastNameOfParticipant(participant){
    return `${participant.firstName} ${participant.lastName}`
  }
}
