// Twilio
import {Participant} from 'twilio-video';

export abstract class AbstractParticipant {

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
      trackPublication: any
    ) => {
      return trackPublication.track;
    });
    this.attachTracks(tracks, container);
  }

  /**
   *  Detach the Tracks from the DOM.
   * @param tracks - track to detach of the DOM
   */
  detachTracks(tracks) {
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
  detachParticipantTracks(participant: Participant) {
    const tracks = Array.from(participant.tracks.values()).map((
      trackPublication: any
    ) => {
      return trackPublication.track;
    });
    this.detachTracks(tracks);
  }
}
