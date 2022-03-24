import firebase  from 'firebase/app';
import "firebase/auth";
import { firebase as firebaseConfig } from '@env';

//Note:
// This file is intended to be imported from support commands
// Only code required for custom commands go in here.

//Init the app
const app = firebase.initializeApp(firebaseConfig());

export const login = (email: string, password: string) => {
  return app.auth().signInWithEmailAndPassword(email, password);
}

export const logout = () => {
  return app.auth().signOut();
}
