import '@angular/compiler';
import { signInWithEmailAndPassword, signOut, getAuth } from '@angular/fire/auth';

//Note:
// This file is intended to be imported from support commands
// Only code required for custom commands go in here.

export const login = (email: string, password: string) => {
  return signInWithEmailAndPassword(getAuth(), email, password);
}

export const logout = () => {
  return signOut(getAuth());
}
