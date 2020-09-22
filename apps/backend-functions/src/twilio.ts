import {CallableContext} from "firebase-functions/lib/providers/https";

//import generic var for twilio
import {twilioSecret, twilioSid, twilioToken} from './environments/environment';

import {isUserInvitedToMeetingOrScreening} from "./internals/invitations/events";

import {getDocument} from "@blockframes/firebase-utils";
import {EventDocument, Meeting} from "@blockframes/event/+state/event.firestore";
import {ErrorResultResponse} from "@blockframes/utils/utils";

//import twilio to create the access token
const twilio = require('twilio');

const AccessToken = twilio.jwt.AccessToken;
const VideoGrant = AccessToken.VideoGrant;

export interface RequestAccessToken {
  eventId: string,
}

/**
 *
 * Create Twilio Access Token if access right ok
 * @param data : RequestAccessToken - identity, roomName, eventId
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

  const event: EventDocument<Meeting> = await getDocument<EventDocument<Meeting>>(`events/${eventId}`);

  //If no event find
  if (!event) {
    return {
      error: 'UNKNOWN_EVENT',
      result: `There is no event with the ID ${eventId}`
    };
  }

  //If event find is not a meeting Event
  if (event.type !== 'meeting') {
    return {
      error: 'NOT_A_MEETING',
      result: `The event ${eventId} is not a meeting`
    };
  }

  // User need to be invite to a event or be is owner
  if (!(event.meta.organizerId === userId || await isUserInvitedToMeetingOrScreening(context.auth.uid, eventId))){
    return {
      error: 'NO_INVITATION',
      result: `You have not been invited to see this meeting`
    };
  }

  //Creat access token with twilio global var et identity of the user as identity of token
  const token = new AccessToken(twilioSid, twilioToken, twilioSecret, {identity: userId});
  //Create VideoGrant of room. RoomName is the EventId
  const videoGrant = new VideoGrant({ room: eventId });
  //add Grant to token
  token.addGrant(videoGrant);

  //return token
  return {
    error: '',
    result: token.toJwt()
  };
};
