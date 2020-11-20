
import { CallableContext } from "firebase-functions/lib/providers/https";

import { getDocument } from "@blockframes/firebase-utils";
import { EventDocument, Meeting } from "@blockframes/event/+state/event.firestore";
import { ErrorResultResponse } from "@blockframes/utils/utils";

import { twilioApiKeySecret, twilioAccountSid, twilioApiKeySid } from './environments/environment';
import { hasUserAcceptedEvent } from "./internals/invitations/meetings";
import AccessToken, { VideoGrant } from "twilio/lib/jwt/AccessToken";
import { getUser } from "./internals/firebase";

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

  if (!context.auth) {
    throw new Error(`Unauthorized call !`);
  }

  const { eventId } = data;
  if (!eventId) {
    throw new Error(`No 'eventId' params, this parameter is mandatory !`);
  }

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
  if (!(event.meta.organizerId === context.auth.uid || await hasUserAcceptedEvent(context.auth.uid, eventId))) {
    return {
      error: 'NOT_ACCEPTED',
      result: `You are not the owner of the event or you have not been invited to see this meeting`
    };
  }

  const user = await getUser(context.auth.uid);
  const identity = `${user.firstName[0].toUpperCase()}${user.firstName.substr(1).toLowerCase()} ${user.lastName[0].toUpperCase()}${user.lastName.substr(1).toLowerCase()}`;

  // Create access token with twilio global var et identity of the user as identity of token
  const token = new AccessToken(twilioAccountSid, twilioApiKeySid, twilioApiKeySecret, { identity });
  // Create VideoGrant of room. RoomName is the EventId
  const videoGrant = new VideoGrant({room: eventId});
  // add Grant to token
  token.addGrant(videoGrant);

  return {
    error: '',
    result: token.toJwt()
  };
};
