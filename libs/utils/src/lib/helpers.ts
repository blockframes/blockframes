
import firebase from "firebase/app";

/** Return the current value of the path from Firestore */
export async function snapshot<T>(path: string): Promise<T> {
  // If path targets a collection ( odd number of segments after the split )
  if (path.split('/').length % 2 !== 0) {
    const snap = await firebase.firestore().collection(path).get();
    return snap.docs.map(doc => doc.data()) as any;
    // Else path targets a doc
  } else {
    const snap = await firebase.firestore().doc(path).get();
    return snap.data() as any;
  }
}

/**
 * @see #483
 * This method is used before pushing data on db
 * to prevent "Unsupported field value: undefined" errors.
 * Doing JSON.parse(JSON.stringify(data)) clones object and
 * removes undefined fields and empty arrays.
 * This methods also removes readonly settings on objects coming from Akita
 */
export function cleanModel<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}
