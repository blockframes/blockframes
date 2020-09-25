import {MeetingService} from "@blockframes/event/components/meeting/+state/meeting.service";

export abstract class AbstractParticipant{

  protected constructor() {}

  /**
   * Attach the Tracks to the DOM.
   * @param tracks - track to attach in the container
   * @param container - container from DOM to attach the track
   * @param className - name of class css
   */
  attachTracks(tracks, container, className) {
    console.log('attachTracks : ', {tracks, container})
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
  attachParticipantTracks(participant, container, nameClass) {
    console.log('attachParticipantTracks : ', {participant})
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
    console.log('detachTracks : ', {tracks})
    tracks.forEach((track) => {
      if (track) {
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
  detachParticipantTracks(participant) {
    console.log('detachParticipantTracks : ', {participant})
    const tracks = Array.from(participant.tracks.values()).map((
      trackPublication : any
    ) => {
      return trackPublication.track;
    });
    this.detachTracks(tracks);
  }

  /**
   *
   * @param participant
   */
  getInitialFromParticipant(participant){
    return `${participant.firstName.charAt(0).toUpperCase()}${participant.lastName.charAt(0).toUpperCase()}`
  }
}
