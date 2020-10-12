import {BehaviorSubject, Observable} from "rxjs";
import {Participant, RemoteAudioTrack, RemoteDataTrack, RemoteTrackPublication, RemoteVideoTrack} from 'twilio-video';
import {IStatusVideoMic} from "@blockframes/event/components/meeting/+state/meeting.service";
import {IParticipantMeeting} from "@blockframes/event/components/meeting/+state/meeting.interface";

export abstract class AbstractParticipant{

  protected $camMicIsOnDataSource: BehaviorSubject<IStatusVideoMic> = new BehaviorSubject({video: false, audio: false});
  public camMicIsOn$: Observable<IStatusVideoMic> = this.$camMicIsOnDataSource.asObservable();

  protected constructor() {
    this.$camMicIsOnDataSource.next({video: false, audio: false})
  }

  /**
   * Attach the Tracks to the DOM.
   * @param tracks - track to attach in the container
   * @param container - container from DOM to attach the track
   */
  attachTracks(tracks, container) {
    tracks.forEach((track) => {
      if (track) {
        container.appendChild(track.attach());
      }
    });
  }

  /**
   * Attach the Participant's Tracks to the DOM.
   * @param participant - participant to attach in the container
   * @param container - container of participant in DOM
   */
  attachParticipantTracks(participant: Participant, container) {
    const tracks = Array.from(participant.tracks.values()).map((
      trackPublication : any
    ) => {
      return trackPublication.track;
    });
    this.attachTracks(tracks, container);
  }

  /**
   *  Detach the Tracks from the DOM.
   * @param tracks - track to detach of the DOM
   */
  detachTracks(tracks ) {
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
   * Detach the Participant's Tracks from the DOM.
   * @param participant - participant to detach track of the DOM
   */
  detachParticipantTracks(participant: IParticipantMeeting) {
    const tracks = Array.from(participant.twilioData.tracks.values()).map((
      trackPublication : any
    ) => {
      return trackPublication.track;
    });
    this.detachTracks(tracks);
  }

  /**
   *
   * @param trackPublication
   */
  getTrackFromRemoteTrackPublication(trackPublication:RemoteTrackPublication): RemoteVideoTrack|RemoteAudioTrack|RemoteDataTrack {
    return trackPublication.track;
  }

  setUpVideoAndAudio(kind, boolToChange){
    if(kind === 'video'){
      this.$camMicIsOnDataSource.next( {...this.$camMicIsOnDataSource.getValue(), video: boolToChange});
    } else {
      this.$camMicIsOnDataSource.next( {...this.$camMicIsOnDataSource.getValue(), audio: boolToChange});
    }
  }
}
