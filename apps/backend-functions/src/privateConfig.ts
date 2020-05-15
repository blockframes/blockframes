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
  if (!context || !context.auth) { throw new Error('Permission denied: missing auth context.'); }
  const admin = await db.doc(`blockframesAdmin/${context.auth.uid}`).get();
  if (!admin.exists) { throw new Error('Permission denied: you are not blockframes admin'); }

  return await db.doc(`docsIndex/${data.docId}`).set({ config: data.config }, { merge: true });
};

/**
 * Generic https callable function to get privateConfig for a document.
 * Can only be called by blockframes admin
 * @param data 
 * @param context 
 */
export const getDocumentPrivateConfig = async (data: { docId: string, keys: string[] }, context: CallableContext) => {
  if (!context || !context.auth) { throw new Error('Permission denied: missing auth context.'); }
  const admin = await db.doc(`blockframesAdmin/${context.auth.uid}`).get();
  if (!admin.exists) { throw new Error('Permission denied: you are not blockframes admin'); }

  const snap = await db.doc(`docsIndex/${data.docId}`).get();
  if (!snap.exists) { return false; }

  const doc = snap.data();
  if (!doc) { return false; }

  const config = doc.config as PrivateConfig;
  if (data.keys.length) {
    // @TODO return only the keys from data.keys
  }
  return config;
};

