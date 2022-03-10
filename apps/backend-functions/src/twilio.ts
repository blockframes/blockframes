
import { CallableContext } from "firebase-functions/lib/providers/https";
import { getDocument } from "@blockframes/firebase-utils";
import { EventDocument, Meeting } from "@blockframes/event/+state/event.firestore";
import { ErrorResultResponse, displayName } from "@blockframes/utils/utils";
import { projectId, twilioAccountSid, twilioAccountSecret, twilioApiKeySecret, twilioApiKeySid } from './environments/environment';
import Twilio from "twilio/lib/rest/Twilio";
import AccessToken, { VideoGrant } from "twilio/lib/jwt/AccessToken";
import { firebaseRegion } from "./internals/utils";
import * as admin from 'firebase-admin';
import { getUser } from "./internals/utils";
import { Request, Response } from "firebase-functions";
import { isUserInvitedToEvent } from "./internals/invitations/events";
import { PublicUser } from "@blockframes/model";

export interface RequestAccessToken {
  eventId: string,
  credentials: PublicUser,
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

  const isOwner = async () => {
    const user = await getUser(context.auth.uid);
    if (event.meta.organizerUid === context.auth.uid) return true;
    return !!user && !!user.orgId && user.orgId === event.ownerOrgId;
  }

  // Check if user is owner or is invited to event
  if (!(await isOwner() || await isUserInvitedToEvent(context.auth.uid, event, data.credentials.email))) {
    return {
      error: 'NOT_ACCEPTED',
      result: `You are not the owner of the event or you have not been invited to see this meeting`
    };
  }

  const identity = JSON.stringify({ id: context.auth.uid, displayName: displayName(data.credentials) });

  // Create access token with twilio global var et identity of the user as identity of token
  const token = new AccessToken(twilioAccountSid, twilioApiKeySid, twilioApiKeySecret, { identity });
  // Create VideoGrant of room. RoomName is the EventId
  const videoGrant = new VideoGrant({ room: eventId });
  // add Grant to token
  token.addGrant(videoGrant);

  const client = new Twilio(twilioAccountSid, twilioAccountSecret);
  const [roomAlreadyExists] = await client.video.rooms.list({ uniqueName: eventId, limit: 1 });
  if (!roomAlreadyExists) {
    await client.video.rooms.create({
      uniqueName: eventId,
      statusCallback: `https://${firebaseRegion}-${projectId}.cloudfunctions.net/twilioWebhook`,
      statusCallbackMethod: 'POST',
    });
  }

  return {
    error: '',
    result: token.toJwt()
  };
};

/** This function will be called directly by the Twilio servers each time an event happens in a Video Room */
export const twilioWebhook = async (req: Request, res: Response) => {
  const db = admin.firestore();
  try {

    if (
      // we first check if the request come from Twilio server
      req.body.AccountSid !== twilioAccountSid ||
      ( // we are interested only by those 2 events
        req.body.StatusCallbackEvent !== 'participant-disconnected' &&
        req.body.StatusCallbackEvent !== 'room-ended'
      )
    ) {
      // in any case we return 200 OK to the twilio servers
      res.status(200).send();
      return;
    }

    const eventId = req.body.RoomName;
    const eventRef = db.collection('events').doc(eventId);
    const eventSnap = await eventRef.get();
    if (!eventSnap.exists) {
      res.status(200).send();
      return;
    }

    if (req.body.StatusCallbackEvent === 'participant-disconnected') {

      const { id: userId } = JSON.parse(req.body.ParticipantIdentity) as { id: string };
      const event = eventSnap.data() as EventDocument<Meeting>;
      const attendee = event.meta?.attendees[userId];
      attendee.status = 'ended';
      eventRef.update({ [`meta.attendees.${userId}`]: attendee });
    } else {
      eventRef.update({ 'meta.attendees': {} });
    }


  } catch (e) {
    console.warn(e);
  }

  // in any case we return 200 OK to the twilio servers
  res.status(200).send();
  return;
};
