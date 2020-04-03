import { CallableContext } from "firebase-functions/lib/providers/https";
import { db } from './internals/firebase';
import { PrivateConfig } from "@blockframes/utils/common-interfaces/utility";


/**
 * Generic https callable function to set privateConfig for a document.
 * Can only be called by blockframes admin
 * @param data 
 * @param context 
 */
export const setDocumentPrivateConfig = async (data: { docId: string, config: PrivateConfig }, context: CallableContext) => {
  if (!context || !context.auth) { return false; }
  const admin = await db.doc(`blockframesAdmin/${context.auth.uid}`).get();
  if (!admin.exists) { return false; }

  return await db.doc(`docsIndex/${data.docId}`).set({ config: data.config }, { merge: true });
};

/**
 * Generic https callable function to get privateConfig for a document.
 * Can only be called by blockframes admin
 * @param data 
 * @param context 
 */
export const getDocumentPrivateConfig = async (data: { docId: string }, context: CallableContext) => {
  if (!context || !context.auth) { return false; }
  const admin = await db.doc(`blockframesAdmin/${context.auth.uid}`).get();
  if (!admin.exists) { return false; }

  const snap = await db.doc(`docsIndex/${data.docId}`).get();
  if (!snap.exists) { return false; }

  const doc = snap.data();

  return doc ? doc.config as PrivateConfig : false;
};

/**
 * Specific httpsCallable function to set event URL
 * Can only be called by blockframes admin or eventOwnerId
 * @param data 
 * @param context 
 * @TODO (#2244) we can remove this if getEventUrl directly fetch private Config from movie
 * associated to event
 */
export const setEventUrl = async (data: { eventId: string }, context: CallableContext) => {
  if (!context || !context.auth) { return false; }
  const admin = await db.doc(`blockframesAdmin/${context.auth.uid}`).get();
  const snap = await db.doc(`events/${data.eventId}`).get();
  const event = snap.data();
  if (!event || !event.meta || !event.meta.titleId) { return false; }

  let allowed = false;
  if (admin.exists) {
    allowed = true;
  } else if (event.ownerId === context.auth.uid) {
    allowed = true;
  }
  if (!allowed) { return false; }

  const movieDocsIndexSnap = await db.doc(`docsIndex/${event.meta.titleId}`).get();
  const movieDocsIndex = movieDocsIndexSnap.data();

  if (!movieDocsIndex || !movieDocsIndex.config.url) { return false; }

  const config = { url: movieDocsIndex.config.url }
  return await db.doc(`docsIndex/${data.eventId}`).set({ config }, { merge: true });
};

/**
 * Specific httpsCallable function to get event URL
 * Can only be called by blockframes admin or user allowed to attend event
 * @param data 
 * @param context 
 */
export const getEventUrl = async (data: { eventId: string }, context: CallableContext) => {
  if (!context || !context.auth) { return false; }
  const admin = await db.doc(`blockframesAdmin/${context.auth.uid}`).get();
  const snap = await db.doc(`docsIndex/${data.eventId}`).get();
  if (!snap.exists) { return false; }
  const event = snap.data();
  if (!event || !event.meta || !event.meta.titleId) { return false; }

  let allowed = false;
  if (admin.exists) {
    allowed = true;
  } else {
    // @TODO (#2244) check if uid is invited to data.eventId && if scope dates is ok
    // const uid = context.auth.uid;
  }
  if (!allowed) { return false; }

  const doc = snap.data();
  return doc ? (doc.config as PrivateConfig).url : false;
};
