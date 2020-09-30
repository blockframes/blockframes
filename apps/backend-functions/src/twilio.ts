/**
 * Clouds functions use to access twilio secure functions.
 */


import {CallableContext} from "firebase-functions/lib/providers/https";

import {getDocument} from "@blockframes/firebase-utils";
import {EventDocument, Meeting} from "@blockframes/event/+state/event.firestore";
import {ErrorResultResponse} from "@blockframes/utils/utils";

import * as twilio from "twilio";
import {twilioSecret, twilioSid, twilioToken} from './environments/environment';
import {isUserInvitedToMeetingOrScreening} from "./internals/invitations/events";

const AccessToken = twilio.jwt.AccessToken;
const VideoGrant = AccessToken.VideoGrant;

export interface RequestAccessToken {
  eventId: string,
}

/**
 * If access right granted, create Twilio Access Token for specified room (eventId = roomName)
 * The Twilio video room is automatically created if needed
 * @param data : RequestAccessToken - eventId
 * @param context : CallableContext
 */
export const getTwilioAccessToken = async (
  data: RequestAccessToken,
  context: CallableContext
): Promise<ErrorResultResponse> => {

  if (!data.eventId) {
    throw new Error(`No 'eventId' params, this parameter is mandatory !`);
  }

  if (!context.auth) {
    throw new Error(`Unauthorized call !`);
  }

  const userId = context.auth.uid;
  const eventId = data.eventId;

  // Get meeting from firestore identify by eventId
  const event: EventDocument<Meeting> = await getDocument<EventDocument<Meeting>>(`events/${eventId}`);

  if (!event) {
    return {
      error: 'UNKNOWN_EVENT',
      result: `There is no event with the ID ${eventId}`
    };
  }

  if (event.type !== 'meeting') {
    // Event find is not a meeting Event
    return {
      error: 'NOT_A_MEETING',
      result: `The event ${eventId} is not a meeting`
    };
  }

  if (event.start.toMillis() > Date.now()) {
    return {
      error: 'NOT_ALREADY_STARTED',
      result: `The event ${eventId} is not already started`
    };
  }

  if (event.end.toMillis() < Date.now()) {
    return {
      error: 'EVENT_FINISHED',
      result: `The event ${eventId} is finished`
    };
  }

  // Check if user is owner or is invited to event
  if (!(event.meta.organizerId === userId || await isUserInvitedToMeetingOrScreening(context.auth.uid, eventId))) {
    return {
      error: 'NO_INVITATION',
      result: `You are not the owner of the event or you have not been invited to see this meeting`
    };
  }

  //Create access token with twilio global var et identity of the user as identity of token
  const token = new AccessToken(twilioSid, twilioToken, twilioSecret, {identity: userId});
  //Create VideoGrant of room. RoomName is the EventId
  const videoGrant = new VideoGrant({room: eventId});
  //add Grant to token
  token.addGrant(videoGrant);

  return {
    error: '',
    result: token.toJwt()
  };
};
