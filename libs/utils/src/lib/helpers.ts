
import firebase from "firebase";

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
